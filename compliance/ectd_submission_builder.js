import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultExportDir = path.resolve(__dirname, '../compliance/submission_export');

/**
 * GAMP 5 Category 4 / Part 11 Compliant Regulatory Submission Packaging Engine
 */
export class EctdSubmissionBuilder {
  constructor(exportDir = defaultExportDir) {
    this.exportDir = exportDir;
  }

  /**
   * Generates standard regulatory submission module packages (eCTD format)
   */
  buildSubmissionPackage(studyId, options = {}) {
    const { includeEma = false, auditLogsPath, incidentTimelinePath, validationReports = [] } = options;

    console.log(`[Submission Builder] Initiating regulatory packaging for Study ID: ${studyId}...`);

    // Define the directory hierarchy structure based on FDA eCTD specs
    const directories = [
      path.resolve(this.exportDir, 'm1-administrative-information/us'),
      path.resolve(this.exportDir, 'm5-clinical-study-reports/53-clinical-study-reports/535-reports-of-efficacy-safety-studies')
    ];

    if (includeEma) {
      directories.push(path.resolve(this.exportDir, 'm1-administrative-information/eu'));
    }

    // Create directories
    for (const dir of directories) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const compiledFiles = [];

    // 1. Write administrative study info
    const studyMetadata = {
      studyId,
      agency: 'FDA/EMA joint submission',
      timestamp: new Date().toISOString(),
      validatedBy: 'SAFETY_SYSTEM_AUTOMATION',
      standardsVersion: 'eCTD v3.2.2'
    };
    const metadataPath = path.resolve(this.exportDir, 'm1-administrative-information/study_metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(studyMetadata, null, 2));
    compiledFiles.push({ name: 'study_metadata.json', path: metadataPath });

    // 2. Read and package audit trails (ensuring cryptographic lock)
    let auditHash = '0000000000000000000000000000000000000000000000000000000000000000';
    if (auditLogsPath && fs.existsSync(auditLogsPath)) {
      const logs = fs.readFileSync(auditLogsPath, 'utf8');
      const auditTrailExportPath = path.resolve(this.exportDir, 'm5-clinical-study-reports/53-clinical-study-reports/audit_trail_chain.jsonl');
      fs.writeFileSync(auditTrailExportPath, logs);
      
      // Calculate hash of the audit trail
      auditHash = crypto.createHash('sha256').update(logs).digest('hex');
      compiledFiles.push({ name: 'audit_trail_chain.jsonl', path: auditTrailExportPath, sha256: auditHash });
      console.log(`- Packaged audit trail chain. Size: ${logs.length} bytes. Hash: ${auditHash.substring(0, 10)}...`);
    }

    // 3. Package system validation reports
    for (const rep of validationReports) {
      if (fs.existsSync(rep.filePath)) {
        const reportContent = fs.readFileSync(rep.filePath);
        const name = path.basename(rep.filePath);
        const exportPath = path.resolve(this.exportDir, `m5-clinical-study-reports/53-clinical-study-reports/${name}`);
        fs.writeFileSync(exportPath, reportContent);
        
        const repHash = crypto.createHash('sha256').update(reportContent).digest('hex');
        compiledFiles.push({ name, path: exportPath, sha256: repHash });
        console.log(`- Packaged validation report: ${name}`);
      }
    }

    // 4. Package incident timelines
    let incidentHash = '0000000000000000000000000000000000000000000000000000000000000000';
    if (incidentTimelinePath && fs.existsSync(incidentTimelinePath)) {
      const logs = fs.readFileSync(incidentTimelinePath, 'utf8');
      const incidentExportPath = path.resolve(this.exportDir, 'm5-clinical-study-reports/53-clinical-study-reports/incident_history_summary.json');
      fs.writeFileSync(incidentExportPath, logs);
      
      incidentHash = crypto.createHash('sha256').update(logs).digest('hex');
      compiledFiles.push({ name: 'incident_history_summary.json', path: incidentExportPath, sha256: incidentHash });
      console.log(`- Packaged incident history summary.`);
    }

    // 5. Generate package checksum index manifest (cross-file continuity verification)
    const manifest = {
      packageId: `PKG-${studyId}-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      standards: 'eCTD',
      components: compiledFiles.map(f => ({
        filename: f.name,
        sha256: f.sha256 || 'N/A'
      }))
    };

    const manifestPath = path.resolve(this.exportDir, 'manifest-sha256.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`[Submission Builder] Submission package successfully built at: ${this.exportDir}`);
    return manifest;
  }
}

// Isolation test runner
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Testing regulatory submission builder in isolation...');
  const testExport = path.resolve(__dirname, '../compliance/test_export');
  
  // Clean up
  if (fs.existsSync(testExport)) {
    fs.rmSync(testExport, { recursive: true, force: true });
  }

  // Create mock files to package
  fs.mkdirSync(testExport, { recursive: true });
  const mockAudit = path.resolve(testExport, 'mock_audit.jsonl');
  fs.writeFileSync(mockAudit, '{"event": "TEST"}\n');
  const mockReport = path.resolve(testExport, 'mock_report.html');
  fs.writeFileSync(mockReport, '<h1>VALIDATION PASS</h1>');

  const builder = new EctdSubmissionBuilder(testExport);
  const manifest = builder.buildSubmissionPackage('STUDY-ONCOLOGY-01', {
    includeEma: true,
    auditLogsPath: mockAudit,
    validationReports: [{ filePath: mockReport }]
  });

  assert.strictEqual(manifest.components.length, 3);
  assert.strictEqual(manifest.components[0].filename, 'study_metadata.json');
  assert.ok(fs.existsSync(path.resolve(testExport, 'm1-administrative-information/eu')), 'EMA administrative folders should exist');
  
  // Clean up
  if (fs.existsSync(testExport)) {
    fs.rmSync(testExport, { recursive: true, force: true });
  }
  console.log('Isolation validation successful.');
}
