import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeed() {
  console.log('Seeding Phase 15.2 Demo Study Data for "NovaBio Clinical Research"...');

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
    await client.query("INSERT INTO tenants (id, name, domain, status) VALUES (2, 'NovaBio Clinical Research', 'novabio.com', 'ACTIVE') ON CONFLICT (id) DO NOTHING");
    console.log('[1/12] Seeded tenant NovaBio Clinical Research.');

    // 2. Hash Password "Demo@123"
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Demo@123', salt);

    // 3. Seed Users (50 Investigators, 5 CRAs, 3 DMs, 2 MMs, 1 Safety Officer, 1 Sponsor Executive)
    const users = [];
    
    // 50 Investigators (IDs 201 to 250)
    for (let i = 1; i <= 50; i++) {
      users.push({ id: 200 + i, username: `investigator${i}@novabio.com`, email: `investigator${i}@novabio.com`, role: 'Medical Advisor' });
    }
    // 5 CRAs (IDs 251 to 255)
    for (let i = 1; i <= 5; i++) {
      users.push({ id: 250 + i, username: `cra${i}@novabio.com`, email: `cra${i}@novabio.com`, role: 'CRA Monitor' });
    }
    // 3 Data Managers (IDs 256 to 258)
    for (let i = 1; i <= 3; i++) {
      users.push({ id: 255 + i, username: `dm${i}@novabio.com`, email: `dm${i}@novabio.com`, role: 'Data Manager' });
    }
    // 2 Medical Monitors (IDs 259 to 260)
    for (let i = 1; i <= 2; i++) {
      users.push({ id: 258 + i, username: `medmon${i}@novabio.com`, email: `medmon${i}@novabio.com`, role: 'Medical Monitor' });
    }
    // 1 Safety Officer (ID 261)
    users.push({ id: 261, username: 'safety1@novabio.com', email: 'safety1@novabio.com', role: 'Safety Manager' }); // Fallback safety role
    // 1 Sponsor Admin (ID 262)
    users.push({ id: 262, username: 'sponsor1@novabio.com', email: 'sponsor1@novabio.com', role: 'Admin' });

    for (const u of users) {
      await client.query(
        `INSERT INTO users (id, username, email, password_hash, role, is_active, tenant_id)
         VALUES ($1, $2, $3, $4, $5, true, 2)
         ON CONFLICT (id) DO UPDATE SET password_hash = $4, role = $5`,
        [u.id, u.username, u.email, hash, u.role === 'Safety Manager' ? 'Head of Medical Affairs' : u.role]
      );
    }
    console.log(`[2/12] Seeded ${users.length} users with password 'Demo@123'`);

    // 4. Seed Studies
    await client.query(`
      INSERT INTO studies (id, study_name, protocol_number, status, tenant_id)
      VALUES 
        (10, 'Phase II Oncology Trial', 'NB-ONC-2026', 'ACTIVE', 2),
        (11, 'Type 2 Diabetes Study', 'NB-DIA-2026', 'ACTIVE', 2),
        (12, 'Rheumatology Study', 'NB-RHE-2026', 'ACTIVE', 2)
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('[3/12] Seeded 3 clinical studies.');

    // 5. Seed Sites (15 sites: 101 to 115)
    await client.query(`
      INSERT INTO study_sites (id, study_id, name, site_number, status, tenant_id)
      VALUES 
        (101, 10, 'Dana-Farber Cancer Institute', 'NB-SITE-001', 'ACTIVE', 2),
        (102, 10, 'Memorial Sloan Kettering', 'NB-SITE-002', 'ACTIVE', 2),
        (103, 10, 'UCSF Medical Center', 'NB-SITE-003', 'ACTIVE', 2),
        (104, 10, 'Seattle Cancer Care Alliance', 'NB-SITE-004', 'ACTIVE', 2),
        (105, 10, 'Abramson Cancer Center', 'NB-SITE-005', 'ACTIVE', 2),
        
        (106, 11, 'Joslin Diabetes Center', 'NB-SITE-006', 'ACTIVE', 2),
        (107, 11, 'UT Southwestern Diabetes', 'NB-SITE-007', 'ACTIVE', 2),
        (108, 11, 'University of Chicago Medicine', 'NB-SITE-008', 'ACTIVE', 2),
        (109, 11, 'Vanderbilt Endocrinology', 'NB-SITE-009', 'ACTIVE', 2),
        (110, 11, 'Northwestern Memorial Clinic', 'NB-SITE-010', 'ACTIVE', 2),
        
        (111, 12, 'Hospital for Special Surgery', 'NB-SITE-011', 'ACTIVE', 2),
        (112, 12, 'Johns Hopkins Rheumatology', 'NB-SITE-012', 'ACTIVE', 2),
        (113, 12, 'Cleveland Clinic Rheumatology', 'NB-SITE-013', 'ACTIVE', 2),
        (114, 12, 'Brigham and Womens Hospital', 'NB-SITE-014', 'ACTIVE', 2),
        (115, 12, 'Mayo Clinic Rheumatology', 'NB-SITE-015', 'ACTIVE', 2)
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('[4/12] Seeded 15 investigator sites.');

    // 6. Seed Subjects (500 subjects: 1001 to 1500)
    console.log('Seeding 500 subjects...');
    const subjectValues = [];
    for (let i = 1; i <= 500; i++) {
      const subjectId = 1000 + i;
      const siteId = 101 + ((i - 1) % 15);
      const studyId = siteId <= 105 ? 10 : (siteId <= 110 ? 11 : 12);
      const subjectNum = `NB-SUB-${studyId}-${String(i).padStart(3, '0')}`;
      subjectValues.push(`(${subjectId}, ${studyId}, ${siteId}, '${subjectNum}', 'ENROLLED', 2)`);
    }
    
    // Batch insert subjects
    await client.query(`
      INSERT INTO study_subjects (id, study_id, site_id, subject_number, status, tenant_id)
      VALUES ${subjectValues.join(',\n')}
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('[5/12] Seeded 500 trial subjects.');

    // 7. Seed Visits (3 visits per subject = 1500 visits: IDs 10001 to 11500)
    console.log('Seeding 1500 subject visits...');
    const visitValues = [];
    for (let i = 1; i <= 500; i++) {
      const subjectId = 1000 + i;
      const screeningId = 10000 + (i - 1) * 3 + 1;
      const baselineId = 10000 + (i - 1) * 3 + 2;
      const followupId = 10000 + (i - 1) * 3 + 3;
      
      visitValues.push(`(${screeningId}, ${subjectId}, 'Screening Visit', CURRENT_DATE - 30, 'COMPLETED', 2)`);
      visitValues.push(`(${baselineId}, ${subjectId}, 'Baseline Visit', CURRENT_DATE - 15, 'COMPLETED', 2)`);
      visitValues.push(`(${followupId}, ${subjectId}, 'Month 1 Follow-up', CURRENT_DATE + 15, 'SCHEDULED', 2)`);
    }

    await client.query(`
      INSERT INTO subject_visits (id, subject_id, visit_name, scheduled_date, status, tenant_id)
      VALUES ${visitValues.join(',\n')}
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('[6/12] Seeded 1500 calendar visits.');

    // 8. Seed DCT virtual visits (100 scheduled virtual visits)
    console.log('Seeding virtual visits...');
    const virtualVisitValues = [];
    for (let i = 1; i <= 100; i++) {
      const subjectId = 1000 + i;
      const visitId = 10000 + (i - 1) * 3 + 3; // Month 1 Follow-up (Scheduled)
      const room = `room-novabio-v${i}`;
      virtualVisitValues.push(`(${i + 10}, ${subjectId}, ${visitId}, CURRENT_TIMESTAMP + INTERVAL '${i} days', CURRENT_TIMESTAMP + INTERVAL '${i} days' + INTERVAL '1 hour', '${room}', 'SCHEDULED', 2)`);
    }

    await client.query(`
      INSERT INTO dct_virtual_visits (id, subject_id, visit_id, scheduled_start, scheduled_end, video_room_id, visit_status, tenant_id)
      VALUES ${virtualVisitValues.join(',\n')}
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('[7/12] Seeded 100 virtual visit schedules.');

    // 9. Seed RTSM Block Randomization Configs & Assignments
    await client.query(`
      INSERT INTO study_randomization_configs (id, study_id, block_sizes, stratification_factors, randomization_ratio, is_active, tenant_id)
      VALUES 
        (10, 10, '{4, 6}', '{site_id}', '1:1', true, 2),
        (11, 11, '{4, 6}', '{site_id}', '1:1', true, 2),
        (12, 12, '{4, 6}', '{site_id}', '1:1', true, 2)
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('Seeding randomizations for oncology subjects...');
    const randValues = [];
    for (let i = 1; i <= 200; i++) {
      const subjectId = 1000 + i;
      const arm = i % 2 === 0 ? 'ACTIVE' : 'PLACEBO';
      const randNum = `NB-RAND-${arm[0]}-${10000 + i}`;
      randValues.push(`(${subjectId}, '${randNum}', '${arm}', 2)`);
    }
    await client.query(`
      INSERT INTO subject_randomizations (subject_id, randomization_number, treatment_arm, tenant_id)
      VALUES ${randValues.join(',\n')}
      ON CONFLICT (subject_id) DO NOTHING
    `);
    console.log('[8/12] Seeded 200 subject randomizations.');

    // 10. Seed Supply Drug Kits (1000 kits)
    console.log('Seeding 1000 drug kits...');
    const kitValues = [];
    for (let i = 1; i <= 1000; i++) {
      const kitNum = `NB-KIT-${100000 + i}`;
      const studyId = i <= 400 ? 10 : (i <= 700 ? 11 : 12);
      const siteId = 101 + (i % 15);
      const arm = i % 2 === 0 ? 'ACTIVE' : 'PLACEBO';
      const status = i <= 200 ? 'DISPENSED' : (i <= 250 ? 'QUARANTINED' : 'AVAILABLE');
      kitValues.push(`(${i + 100}, ${studyId}, ${siteId}, '${kitNum}', '${arm}', '${status}', true, CURRENT_TIMESTAMP + INTERVAL '365 days', 2)`);
    }

    await client.query(`
      INSERT INTO study_supply_kits (id, study_id, site_id, kit_number, treatment_arm, status, is_blinded, expiration_date, tenant_id)
      VALUES ${kitValues.join(',\n')}
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('[9/12] Seeded 1000 RTSM study supply kits.');

    // 11. Seed ePRO response diaries (500 records)
    console.log('Seeding ePRO response records...');
    const eproValues = [];
    for (let i = 1; i <= 200; i++) {
      const subjectId = 1000 + i;
      const visitId = 10000 + (i - 1) * 3 + 2; // Baseline completed visit
      const responses = JSON.stringify({ pain_score: (i % 6) + 1, hours_slept: (i % 4) + 6, symptoms_noted: i % 3 === 0 ? 'Mild nausea' : 'None' });
      eproValues.push(`(${subjectId}, ${visitId}, 1, '${responses}', 'Android SDK Wearable Device', 'device_sig_nb_${i}', CURRENT_TIMESTAMP - INTERVAL '15 days', 2)`);
    }
    await client.query(`
      INSERT INTO epro_responses (subject_id, visit_id, questionnaire_id, responses, submission_device_info, device_signature, submitted_at, tenant_id)
      VALUES ${eproValues.join(',\n')}
      ON CONFLICT DO NOTHING
    `);
    console.log('[10/12] Seeded 200 ePRO response logs.');

    // 12. Seed AI Alerts (50 alerts)
    console.log('Seeding 50 AI Risk alerts...');
    const alertValues = [];
    for (let i = 1; i <= 50; i++) {
      const type = i % 3 === 0 ? 'SAFETY_SIGNAL' : (i % 3 === 1 ? 'PROTOCOL_DEVIATION' : 'RETENTION_RISK');
      const score = (70 + (i % 26)).toFixed(2);
      const subjectId = 1000 + i;
      const status = i <= 10 ? 'APPROVED' : (i <= 15 ? 'REJECTED' : 'PENDING_REVIEW');
      const notes = i <= 15 ? 'Verified via manual database audit checks.' : null;
      const revId = i <= 15 ? 259 : null;
      const notesVal = notes ? `'${notes}'` : 'NULL';
      const revIdVal = revId ? `${revId}` : 'NULL';
      alertValues.push(`(${i + 100}, '${type}', ${subjectId}, ${score}, '${status}', ${notesVal}, ${revIdVal}, 2)`);
    }
    await client.query(`
      INSERT INTO ai_alerts (id, alert_type, target_id, score_percentage, alert_status, review_notes, reviewer_id, tenant_id)
      VALUES ${alertValues.join(',\n')}
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('[11/12] Seeded 50 AI alerts.');

    // 13. Seed Wearables Telemetry Data (1000 data points)
    console.log('Seeding 1000 wearable telemetry data points...');
    const telemetryValues = [];
    for (let i = 1; i <= 500; i++) {
      const subjectId = 1000 + (i % 200 + 1);
      const timeOffset = i * 10; // offset in minutes
      telemetryValues.push(`(${subjectId}, 'FITBIT', 'HEART_RATE_BPM', ${(70 + (i % 25)).toFixed(1)}, CURRENT_TIMESTAMP - INTERVAL '${timeOffset} minutes', 2)`);
      telemetryValues.push(`(${subjectId}, 'APPLE_HEALTH', 'STEPS', ${(5000 + (i * 10) % 8000)}, CURRENT_TIMESTAMP - INTERVAL '${timeOffset} minutes', 2)`);
    }
    await client.query(`
      INSERT INTO subject_wearable_telemetry (subject_id, source_provider, metric_type, metric_value, recorded_at, tenant_id)
      VALUES ${telemetryValues.join(',\n')}
      ON CONFLICT DO NOTHING
    `);
    console.log('[12/12] Seeded 1000 subject wearable telemetry data points.');

    console.log('========================================================');
    console.log('PHASE 15.2 DATABASE DEMO SEEDING COMPLETED SUCCESSFULLY');
    console.log('========================================================');
  } catch (err) {
    console.error('Phase 15.2 Seeding failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
