import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  S3_BUCKET,
  S3_ENDPOINT,
} = process.env;

export const isS3Configured = Boolean(
  AWS_REGION && AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && S3_BUCKET
);

// S3-compatible client (works with AWS S3 and S3-compatible providers like
// Cloudflare R2 / MinIO via a custom S3_ENDPOINT).
export const s3 = isS3Configured
  ? new S3Client({
      region: AWS_REGION,
      endpoint: S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

export { PutObjectCommand, DeleteObjectCommand };
export const S3_BUCKET_NAME = S3_BUCKET;
