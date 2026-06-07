import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

/**
 * Monorepo Release Build and Package System
 */
async function buildRelease() {
  console.log('========================================================');
  console.log('CLINCOMMAND OS™ – CONTROLLED PILOT RELEASE BUILD ENGINE');
  console.log('========================================================\n');

  const releaseVersion = process.env.RELEASE_VERSION || 'v15.4.0-pilot';
  const releaseDir = path.resolve(rootDir, 'deployment/release');
  const checksumsPath = path.join(releaseDir, 'checksums.json');
  const sealPath = path.join(releaseDir, 'release.seal');

  console.log(`Target Release Version: ${releaseVersion}`);
  
  if (!fs.existsSync(releaseDir)) {
    fs.mkdirSync(releaseDir, { recursive: true });
  }

  // 1. Files to inventory and validate checksum integrity
  const assetsToHash = [
    'apps/api-core/server.js',
    'apps/web/src/App.tsx',
    'apps/web/src/components/layout/Sidebar.tsx',
    'packages/crypto-sdk/index.js',
    'packages/auth-sdk/sso.js',
    'services/coding-gateway/index.js'
  ];

  const checksums = {};

  console.log('Generating SHA-256 asset checksums...');
  for (const asset of assetsToHash) {
    const fullPath = path.resolve(rootDir, asset);
    if (fs.existsSync(fullPath)) {
      const data = fs.readFileSync(fullPath);
      const hash = crypto.createHash('sha256').update(data).digest('hex');
      checksums[asset] = hash;
      console.log(`  [HASH] ${asset}: ${hash.substring(0, 16)}...`);
    } else {
      console.warn(`  [WARN] Missing asset: ${asset}`);
      checksums[asset] = 'MISSING';
    }
  }

  // Write checksums JSON
  fs.writeFileSync(checksumsPath, JSON.stringify(checksums, null, 2));
  console.log(`\nSuccessfully wrote checksums manifest to: ${checksumsPath}`);

  // 2. Generate Immutable Release Seal File
  const sealData = {
    version: releaseVersion,
    timestamp: new Date().toISOString(),
    lockedBy: process.env.USER || 'builder',
    buildLock: crypto.randomBytes(32).toString('hex'),
    assetCount: assetsToHash.length,
    integrityHash: crypto.createHash('sha256').update(JSON.stringify(checksums)).digest('hex')
  };

  fs.writeFileSync(sealPath, JSON.stringify(sealData, null, 2));
  console.log(`Successfully generated release seal file: ${sealPath}`);
  console.log(`Release Integrity Signature: ${sealData.integrityHash}\n`);
  console.log('========================================================');
  console.log('BUILD PACKAGING SUCCESSFUL | RELEASE LOCK SEALED');
  console.log('========================================================');
}

buildRelease().catch(err => {
  console.error('Release Build failed:', err);
  process.exit(1);
});
