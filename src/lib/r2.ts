import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'spycam-videos';

let r2Client: S3Client | null = null;

export function getR2Client(): S3Client | null {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    return null;
  }

  if (!r2Client) {
    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }

  return r2Client;
}

/**
 * Checks if a string represents an R2 storage key or URI
 */
export function isR2Key(keyOrUrl: string): boolean {
  if (!keyOrUrl) return false;
  return keyOrUrl.startsWith('r2://') || keyOrUrl.startsWith('r2:') || keyOrUrl.startsWith('private://');
}

/**
 * Normalizes an R2 key (strips protocol prefixes)
 */
export function cleanR2Key(keyOrUrl: string): string {
  if (!keyOrUrl) return '';
  return keyOrUrl.replace(/^(r2:\/\/|r2:|private:\/\/)/i, '').trim();
}

/**
 * Generates an ephemeral cryptographically presigned URL valid for a limited time (default 15 minutes).
 * This prevents permanent URL sharing and prevents unreleased media leaks.
 */
export async function generatePresignedVideoUrl(key: string, expiresInSeconds: number = 900): Promise<string | null> {
  const client = getR2Client();
  if (!client) return null;

  try {
    const cleanedKey = cleanR2Key(key);
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: cleanedKey,
    });

    return await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  } catch (error) {
    console.error('Error generating Cloudflare R2 presigned URL:', error);
    return null;
  }
}
