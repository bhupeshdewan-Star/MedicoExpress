import { S3Client, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { isSimulated } from '../config/db.js';

/**
 * Automatically provisions local MinIO S3 buckets on backend startup
 */
export async function initializeMinioBuckets() {
  if (process.env.NODE_ENV === 'test' || isSimulated) {
    console.log('[MinIO Initializer] Skipping bucket provisioning in simulated/test mode.');
    return;
  }

  const endpoint = process.env.S3_ENDPOINT || 'http://minio:9000';
  const accessKeyId = process.env.S3_ACCESS_KEY || 'minio_admin';
  const secretAccessKey = process.env.S3_SECRET_KEY || 'minio_admin_secret_key_99';
  const region = process.env.S3_REGION || 'us-east-1';

  console.log(`[MinIO Initializer] Connecting to local S3 endpoint: ${endpoint}...`);

  const s3 = new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    },
    forcePathStyle: true // Mandatory for MinIO path routing compatibility
  });

  const buckets = [
    process.env.S3_BUCKET_RAW || 'clincommand-raw-docs',
    process.env.S3_BUCKET_REDACTED || 'clincommand-redacted-docs',
    process.env.S3_BUCKET_AUDIT || 'clincommand-audit-vault',
    process.env.S3_BUCKET_ETMF || 'clincommand-etmf-binders'
  ];

  for (const bucket of buckets) {
    try {
      // Check if bucket already exists
      await s3.send(new HeadBucketCommand({ Bucket: bucket }));
      console.log(`[MinIO Initializer] Bucket exists: ${bucket}`);
    } catch (err) {
      // Create bucket if missing
      try {
        await s3.send(new CreateBucketCommand({ Bucket: bucket }));
        console.log(`[MinIO Initializer] Successfully created local bucket: ${bucket}`);
      } catch (createErr) {
        console.warn(`[MinIO Initializer] Could not create bucket ${bucket} (MinIO may still be starting): ${createErr.message}`);
      }
    }
  }
}
