import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeed() {
  console.log('Seeding Phase 15.1 Demo Study Data...');
  
  const pool = new pg.Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'enterprise-secure-db-password-9988',
    database: process.env.DB_NAME || 'clincommand',
  });

  const client = await pool.connect();

  try {
    // 1. Seed Tenant
    await client.query("INSERT INTO tenants (id, name, domain, status) VALUES (1, 'Demo Global Health', 'demohealth.com', 'ACTIVE') ON CONFLICT (id) DO NOTHING");
    
    // 2. Hash Password "Demo@123"
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Demo@123', salt);

    // 3. Seed Users
    const users = [
      { id: 101, username: 'sponsor.admin@demo.com', email: 'sponsor.admin@demo.com', role: 'Admin' },
      { id: 102, username: 'cro.admin@demo.com', email: 'cro.admin@demo.com', role: 'Head of Medical Affairs' },
      { id: 103, username: 'investigator@demo.com', email: 'investigator@demo.com', role: 'Medical Advisor' },
      { id: 104, username: 'coordinator@demo.com', email: 'coordinator@demo.com', role: 'Clinical Research Coordinator' },
      { id: 105, username: 'cra@demo.com', email: 'cra@demo.com', role: 'CRA Monitor' },
      { id: 106, username: 'subject@demo.com', email: 'subject@demo.com', role: 'Viewer' }
    ];

    for (const u of users) {
      await client.query(
        `INSERT INTO users (id, username, email, password_hash, role, is_active, tenant_id)
         VALUES ($1, $2, $3, $4, $5, true, 1)
         ON CONFLICT (id) DO UPDATE SET password_hash = $4, role = $5`,
        [u.id, u.username, u.email, hash, u.role]
      );
    }
    console.log('Seeded users successfully.');

    // 4. Seed Studies
    await client.query(`
      INSERT INTO studies (id, study_name, protocol_number, status, tenant_id)
      VALUES 
        (1, 'Oncology Study', 'ONC-2026-001', 'ACTIVE', 1),
        (2, 'Diabetes Study', 'DIA-2026-002', 'ACTIVE', 1),
        (3, 'Cardiology Study', 'CAR-2026-003', 'ACTIVE', 1)
      ON CONFLICT (id) DO NOTHING
    `);

    // 5. Seed Sites (Minimum 5 sites)
    await client.query(`
      INSERT INTO study_sites (id, study_id, name, site_number, status, tenant_id)
      VALUES 
        (1, 1, 'Boston Oncology Center', 'SITE-001', 'ACTIVE', 1),
        (2, 1, 'MD Anderson Cancer Center', 'SITE-002', 'ACTIVE', 1),
        (3, 2, 'Mayo Clinic Diabetes Unit', 'SITE-003', 'ACTIVE', 1),
        (4, 2, 'Cleveland Clinic Endocrinology', 'SITE-004', 'ACTIVE', 1),
        (5, 3, 'Johns Hopkins Cardiology', 'SITE-005', 'ACTIVE', 1)
      ON CONFLICT (id) DO NOTHING
    `);

    // 6. Seed Subjects (Minimum 100 subjects)
    console.log('Seeding 100 subjects...');
    for (let i = 1; i <= 100; i++) {
      const siteId = (i % 5) + 1; // Round-robin sites 1-5
      const studyId = siteId === 1 || siteId === 2 ? 1 : (siteId === 3 || siteId === 4 ? 2 : 3);
      const subjectNum = `SUB-${studyId}${siteId}-${String(i).padStart(3, '0')}`;
      
      await client.query(
        `INSERT INTO study_subjects (id, study_id, site_id, subject_number, status, tenant_id)
         VALUES ($1, $2, $3, $4, 'ENROLLED', 1)
         ON CONFLICT (id) DO NOTHING`,
        [i, studyId, siteId, subjectNum]
      );
    }

    // 7. Seed Visits
    await client.query(`
      INSERT INTO subject_visits (id, subject_id, visit_name, scheduled_date, status, tenant_id)
      VALUES 
        (1, 1, 'Screening Visit', CURRENT_DATE - 30, 'COMPLETED', 1),
        (2, 1, 'Baseline Visit', CURRENT_DATE - 15, 'COMPLETED', 1),
        (3, 1, 'Month 1 Follow-up', CURRENT_DATE + 15, 'SCHEDULED', 1),
        (4, 2, 'Screening Visit', CURRENT_DATE - 10, 'COMPLETED', 1),
        (5, 2, 'Baseline Visit', CURRENT_DATE + 5, 'SCHEDULED', 1)
      ON CONFLICT (id) DO NOTHING
    `);

    // 8. Seed DCT visits
    await client.query(`
      INSERT INTO dct_virtual_visits (id, subject_id, visit_id, scheduled_start, scheduled_end, video_room_id, visit_status, tenant_id)
      VALUES 
        (1, 1, 3, CURRENT_TIMESTAMP + INTERVAL '15 days', CURRENT_TIMESTAMP + INTERVAL '15 days' + INTERVAL '1 hour', 'room-onc-m1-001', 'SCHEDULED', 1),
        (2, 2, 5, CURRENT_TIMESTAMP + INTERVAL '5 days', CURRENT_TIMESTAMP + INTERVAL '5 days' + INTERVAL '1 hour', 'room-dia-bl-002', 'SCHEDULED', 1)
      ON CONFLICT (id) DO NOTHING
    `);

    // 9. Seed AI Risk Alerts
    await client.query(`
      INSERT INTO ai_alerts (id, alert_type, target_id, score_percentage, alert_status, review_notes, reviewer_id, tenant_id)
      VALUES 
        (1, 'SAFETY_SIGNAL', 1, 82.50, 'PENDING_REVIEW', NULL, NULL, 1),
        (2, 'PROTOCOL_DEVIATION', 2, 75.10, 'PENDING_REVIEW', NULL, NULL, 1),
        (3, 'RETENTION_RISK', 3, 90.00, 'PENDING_REVIEW', NULL, NULL, 1)
      ON CONFLICT (id) DO NOTHING
    `);

    // 10. Seed Wearable Telemetry
    await client.query(`
      INSERT INTO subject_wearable_telemetry (subject_id, source_provider, metric_type, metric_value, recorded_at, tenant_id)
      VALUES 
        (1, 'FITBIT', 'HEART_RATE_BPM', 72.00, CURRENT_TIMESTAMP - INTERVAL '1 hour', 1),
        (1, 'FITBIT', 'STEPS', 1250.00, CURRENT_TIMESTAMP - INTERVAL '1 hour', 1),
        (1, 'APPLE_HEALTH', 'GLUCOSE_MG_DL', 110.00, CURRENT_TIMESTAMP - INTERVAL '30 minutes', 1),
        (2, 'GARMIN', 'SYS_BP', 120.00, CURRENT_TIMESTAMP - INTERVAL '2 hours', 1),
        (2, 'GARMIN', 'DIA_BP', 80.00, CURRENT_TIMESTAMP - INTERVAL '2 hours', 1)
      ON CONFLICT DO NOTHING
    `);

    console.log('Phase 15.1 Demo Study Data successfully seeded.');
  } catch (err) {
    console.error('Seeding error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
