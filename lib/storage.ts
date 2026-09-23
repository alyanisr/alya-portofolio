import "server-only";

import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const PUBLIC_BUCKET = "portfolio-public";
export const PRIVATE_BUCKET = "portfolio-private";

const requiredEnvironment = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_ENDPOINT_URL_S3", "AWS_REGION"] as const;

function storageEnvironment() {
  const missing = requiredEnvironment.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Neon Object Storage is not configured. Missing: ${missing.join(", ")}.`);
  return {
    endpoint: process.env.AWS_ENDPOINT_URL_S3!,
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  };
}

function client() {
  return new S3Client({ ...storageEnvironment(), forcePathStyle: true });
}

function encodeKey(key: string) {
  return key.split("/").map(encodeURIComponent).join("/");
}

export function publicObjectUrl(key: string) {
  const { endpoint } = storageEnvironment();
  return `${endpoint.replace(/\/$/, "")}/${PUBLIC_BUCKET}/${encodeKey(key)}`;
}

export async function uploadObject({ bucket, key, body, contentType }: { bucket: typeof PUBLIC_BUCKET | typeof PRIVATE_BUCKET; key: string; body: Uint8Array; contentType: string }) {
  await client().send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType, CacheControl: bucket === PUBLIC_BUCKET ? "public, max-age=31536000, immutable" : "private, no-store" }));
}

export async function privateDownloadUrl(key: string) {
  return getSignedUrl(client(), new GetObjectCommand({ Bucket: PRIVATE_BUCKET, Key: key }), { expiresIn: 60 * 10 });
}

export function isStorageConfigured() {
  return requiredEnvironment.every((key) => Boolean(process.env[key]));
}
