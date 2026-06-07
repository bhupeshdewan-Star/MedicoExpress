import express from 'express';
import crypto from 'crypto';
import Redis from 'ioredis';

const app = express();
app.use(express.json());
const port = process.env.PORT || 8082;

// Telemetry Encryption Helpers
const ENCRYPTION_KEY = crypto.scryptSync(process.env.TELEMETRY_KEY || 'default_secure_telemetry_sealing_key_9988', 'salt', 32);
const IV_LENGTH = 16;

function encryptTelemetry(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Secure Redis Client Setup
let redisClient = null;
const useRedis = process.env.REDIS_HOST || process.env.REDIS_URL;

if (useRedis) {
  try {
    const config = process.env.REDIS_URL || {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      tls: process.env.REDIS_TLS === 'true' ? { rejectUnauthorized: false } : undefined
    };
    redisClient = new Redis(config);
    redisClient.on('error', (err) => {
      console.warn('Redis Connection Error (Wearables Ingest):', err.message);
    });
    console.log('Redis Ingest Buffer: Connection Initialized');
  } catch (err) {
    console.error('Failed to initialize Redis client:', err.message);
  }
}

// In-memory token storage mock
const oauthTokens = {
  fitbit: { accessToken: "fitbit_access_token_123", refreshToken: "fitbit_refresh_token_123", expiresAt: Date.now() + 3600000 },
  garmin: { accessToken: "garmin_access_token_123", refreshToken: "garmin_refresh_token_123", expiresAt: Date.now() + 3600000 },
  apple: { accessToken: "apple_access_token_123", refreshToken: "apple_refresh_token_123", expiresAt: Date.now() + 3600000 }
};

app.get('/health', (req, res) => {
  res.json({ status: 'HEALTHY', service: 'wearables-gateway' });
});

// OAuth Callback Endpoint
app.post('/api/v1/wearables/oauth/token', (req, res) => {
  const { provider, code } = req.body;
  if (!provider || !code) {
    return res.status(400).json({ success: false, error: "provider and authorization code are required." });
  }

  // Simulate token exchange and rotation
  const accessToken = `${provider}_access_token_${crypto.randomBytes(8).toString('hex')}`;
  const refreshToken = `${provider}_refresh_token_${crypto.randomBytes(8).toString('hex')}`;
  oauthTokens[provider] = {
    accessToken,
    refreshToken,
    expiresAt: Date.now() + 3600000
  };

  res.json({
    success: true,
    provider,
    accessToken,
    refreshToken,
    expiresIn: 3600
  });
});

// OAuth Refresh Token Endpoint
app.post('/api/v1/wearables/oauth/refresh', (req, res) => {
  const { provider, refreshToken } = req.body;
  if (!provider || !refreshToken) {
    return res.status(400).json({ success: false, error: "provider and refreshToken are required." });
  }

  const storedToken = oauthTokens[provider];
  if (!storedToken || storedToken.refreshToken !== refreshToken) {
    return res.status(401).json({ success: false, error: "Invalid refresh token." });
  }

  // Perform rotation
  const newAccessToken = `${provider}_access_token_${crypto.randomBytes(8).toString('hex')}`;
  const newRefreshToken = `${provider}_refresh_token_${crypto.randomBytes(8).toString('hex')}`;
  oauthTokens[provider] = {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresAt: Date.now() + 3600000
  };

  res.json({
    success: true,
    provider,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresIn: 3600
  });
});

// Telemetry Ingestion Endpoint
app.post('/api/v1/wearables/ingest', async (req, res) => {
  const { subjectId, provider, metrics } = req.body;
  if (!subjectId || !provider || !Array.isArray(metrics)) {
    return res.status(400).json({ success: false, error: "subjectId, provider, and metrics array are required." });
  }

  const normalizedRecords = [];
  metrics.forEach(m => {
    const { type, value, timestamp } = m;
    // Normalize metrics format as requested by wearables gateway specs
    normalizedRecords.push({
      subject_id: subjectId,
      source_provider: provider.toUpperCase(),
      metric_type: type.toUpperCase(),
      metric_value: parseFloat(value),
      recorded_at: timestamp || new Date().toISOString()
    });
  });

  // Secure Telemetry Encrypted Buffer pushing to Redis
  if (redisClient && redisClient.status === 'ready') {
    try {
      const encryptedData = encryptTelemetry(JSON.stringify(normalizedRecords));
      await redisClient.lpush('telemetry_buffer_queue', encryptedData);
      console.log(`[Redis Buffer] Securely buffered ${normalizedRecords.length} telemetry points (encrypted)`);
    } catch (err) {
      console.warn('[Redis Buffer] Failed to buffer telemetry in Redis:', err.message);
    }
  }

  // Simulate Kafka Event Bus Publishing
  console.log(`[Kafka Gateway] Published ${normalizedRecords.length} records to topic: wearable-raw`);
  console.log(`[Kafka Gateway] Normalizing telemetry inputs...`);
  console.log(`[Kafka Gateway] Published ${normalizedRecords.length} records to topic: wearable-normalized`);

  res.json({
    success: true,
    ingestedCount: normalizedRecords.length,
    records: normalizedRecords
  });
});

app.listen(port, () => {
  console.log(`ClinCommand OS™ - Wearables Gateway running on port ${port}`);
});
