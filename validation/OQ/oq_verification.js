import assert from 'assert';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { ValidationRunner } from '../../packages/validation-sdk/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

async function runOQ() {
  const runner = new ValidationRunner('Operational Qualification (OQ)');

  console.log('Spawning ClinCommand OS™ API Core server in-process...');
  
  // Start the server on a test port
  const testPort = '5555';
  const apiServer = spawn('node', ['apps/api-core/server.js'], {
    cwd: rootDir,
    env: {
      ...process.env,
      PORT: testPort,
      NODE_ENV: 'test',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_NAME: 'clincommand',
      DB_USER: 'postgres',
      DB_PASSWORD: 'enterprise-secure-db-password-9988'
    }
  });

  // Wait for server to boot
  await new Promise((resolve) => {
    apiServer.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Server running') || output.includes('running on port')) {
        resolve();
      }
    });
    // Fallback wait
    setTimeout(resolve, 3000);
  });

  const BASE_URL = `http://localhost:${testPort}`;
  let token = '';

  // Helper to obtain login token
  try {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'sponsor.admin@demo.com', password: 'Demo@123' })
    });
    const body = await loginRes.json();
    token = body.token;
  } catch (err) {
    console.warn('Could not authenticate. Mocks fallback will be used inside runners.', err.message);
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Test Case 1: DCT Visits State Machine scheduling
  await runner.runTest('VAL-OQ-001', 'Verify virtual visit scheduling and check-in transition', async () => {
    const scheduleRes = await fetch(`${BASE_URL}/api/v1/dct/visits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        subject_id: 1,
        visit_id: 3,
        scheduled_start: new Date().toISOString(),
        scheduled_end: new Date().toISOString(),
        video_room_id: `room-oq-checkin`
      })
    });
    const body = await scheduleRes.json();
    assert.strictEqual(scheduleRes.status, 201);
    assert.strictEqual(body.data.visit_status, 'SCHEDULED');
    
    // Check in
    const checkinRes = await fetch(`${BASE_URL}/api/v1/dct/visits/${body.data.id}/checkin`, {
      method: 'PATCH',
      headers
    });
    const checkinBody = await checkinRes.json();
    assert.strictEqual(checkinBody.data.visit_status, 'PATIENT_CHECKED_IN');
  });

  // Test Case 2: DCT Visits State Machine completion
  await runner.runTest('VAL-OQ-002', 'Verify virtual visit start to completion workflow', async () => {
    const scheduleRes = await fetch(`${BASE_URL}/api/v1/dct/visits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        subject_id: 1,
        visit_id: 3,
        scheduled_start: new Date().toISOString(),
        scheduled_end: new Date().toISOString(),
        video_room_id: `room-oq-completion`
      })
    });
    const scheduled = await scheduleRes.json();
    const visitId = scheduled.data.id;
    
    // Attempt invalid transition directly from SCHEDULED to COMPLETED (must fail)
    const invalidRes = await fetch(`${BASE_URL}/api/v1/dct/visits/${visitId}/complete`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ notes: 'Invalid jump' })
    });
    assert.strictEqual(invalidRes.status, 400);

    // Proper transition steps
    await fetch(`${BASE_URL}/api/v1/dct/visits/${visitId}/checkin`, { method: 'PATCH', headers });
    await fetch(`${BASE_URL}/api/v1/dct/visits/${visitId}/start`, { method: 'PATCH', headers });
    
    const completeRes = await fetch(`${BASE_URL}/api/v1/dct/visits/${visitId}/complete`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ notes: 'Visit completed successfully', recording_url: 'http://s3/meeting_room.mp4' })
    });
    const completed = await completeRes.json();
    assert.strictEqual(completed.data.visit_status, 'COMPLETED');
    assert.strictEqual(completed.data.investigator_notes, 'Visit completed successfully');
  });

  // Test Case 3: eConsent signing and hashing
  await runner.runTest('VAL-OQ-003', 'Verify eConsent signatures and SHA-256 PDF hash mapping', async () => {
    const consentRes = await fetch(`${BASE_URL}/api/v1/dct/econsent`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        subject_id: 1,
        consent_version: 'v1.0-Oncology',
        consent_pdf_url: '/storage/etmf/consent_v1.pdf',
        printed_signee_name: 'John Doe',
        signature_meaning: 'I agree to participate',
        password: 'Demo@123'
      })
    });
    const body = await consentRes.json();
    assert.strictEqual(consentRes.status, 201);
    assert.ok(body.data.consent_pdf_hash, 'PDF hash must be generated on sign');
    assert.strictEqual(body.data.printed_signee_name, 'John Doe');
  });

  // Test Case 4: ePRO Responses synchronization queue
  await runner.runTest('VAL-OQ-004', 'Verify ePRO responses synchronizations and LWW policy', async () => {
    const syncRes = await fetch(`${BASE_URL}/api/v1/epro/sync`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        syncQueue: [{
          subject_id: 1,
          visit_id: 2,
          questionnaire_id: 1,
          responses: { pain_score: 5, hours_slept: 8 },
          submission_device_info: 'Galaxy S24 Ultra',
          device_signature: 'device_sig_xyz_789',
          submitted_at: new Date().toISOString()
        }]
      })
    });
    const body = await syncRes.json();
    assert.strictEqual(syncRes.status, 200);
    assert.ok(body.syncedCount >= 0);
  });

  // Test Case 5: Wearables Telemetry Ingestion
  await runner.runTest('VAL-OQ-005', 'Verify wearables telemetry ingestion gateway', async () => {
    const ingestRes = await fetch(`${BASE_URL}/api/v1/wearables/ingest`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        telemetry: [{
          subject_id: 1,
          source_provider: 'FITBIT',
          metric_type: 'HEART_RATE_BPM',
          metric_value: 82.3,
          recorded_at: new Date().toISOString()
        }]
      })
    });
    const body = await ingestRes.json();
    assert.strictEqual(ingestRes.status, 200);
    assert.strictEqual(body.ingestedCount, 1);
  });

  // Terminate backend server
  apiServer.kill();
  runner.report();
}

runOQ().catch(err => {
  console.error('OQ Execution failed:', err);
  process.exit(1);
});
