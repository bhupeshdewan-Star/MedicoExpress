import Redis from 'ioredis';

let redisClient = null;
const useRedis = process.env.REDIS_HOST || process.env.REDIS_URL;

if (useRedis) {
  try {
    const config = process.env.REDIS_URL || {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD
    };
    redisClient = new Redis(config);
    redisClient.on('error', (err) => {
      console.warn('Redis Connection Error (Rate Limiter):', err.message);
    });
    console.log('Redis Rate Limiter: Client Initialized');
  } catch (err) {
    console.error('Failed to initialize Redis client for rate limiting:', err.message);
  }
} else {
  console.log('Redis Rate Limiter: Redis credentials missing. Sliding rate limiting runs in memory-only simulated fallback mode.');
}

// In-memory fallback tracking map
const localRateLimiter = new Map();

/**
 * Sliding window rate limiting middleware.
 * Intercepts requests and enforces strict transaction rates per user/IP.
 */
export async function rateLimiter(req, res, next) {
  const limit = parseInt(process.env.RATE_LIMIT_MAX) || 120; // 120 requests
  const windowSecs = parseInt(process.env.RATE_LIMIT_WINDOW) || 60; // per 60 seconds

  const identifier = req.user ? `user:${req.user.id}` : `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
  const key = `ratelimit:${identifier}`;

  if (redisClient && redisClient.status === 'ready') {
    try {
      const current = await redisClient.incr(key);
      if (current === 1) {
        await redisClient.expire(key, windowSecs);
      }

      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - current));

      if (current > limit) {
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. System limits activity for security and validation. Please retry in 1 minute.'
        });
      }
      return next();
    } catch (err) {
      console.warn('Redis rate limiting query failed, falling back to local memory handler:', err.message);
    }
  }

  // Local memory-based fail-open rate limiting fallback
  const now = Date.now();
  const userRecord = localRateLimiter.get(key) || { requests: [], expiry: now + (windowSecs * 1000) };

  // Filter out expired request timestamps
  userRecord.requests = userRecord.requests.filter(timestamp => timestamp > now - (windowSecs * 1000));
  userRecord.requests.push(now);

  localRateLimiter.set(key, userRecord);

  const currentCount = userRecord.requests.length;
  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - currentCount));

  if (currentCount > limit) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded (In-Memory Fallback). Please try again shortly.'
    });
  }

  next();
}
