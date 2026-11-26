import {
  CreateBucketCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function env(name) {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function requiredEnv(name) {
  const value = env(name);
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

let client;
let bucketReady = false;

export function getS3Config() {
  return {
    endpoint: requiredEnv("S3_ENDPOINT"),
    region: env("S3_REGION") || "us-east-1",
    accessKeyId: requiredEnv("S3_ACCESS_KEY"),
    secretAccessKey: requiredEnv("S3_SECRET_KEY"),
    bucket: requiredEnv("S3_BUCKET"),
    publicUrl: requiredEnv("S3_PUBLIC_URL").replace(/\/$/, ""),
  };
}

export function getS3Client() {
  if (client) return client;

  const config = getS3Config();

  client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return client;
}

export function publicUrl(key) {
  const { publicUrl: base } = getS3Config();
  return `${base}/${key.replace(/^\//, "")}`;
}

async function ensureBucket() {
  if (bucketReady) return;

  const config = getS3Config();
  const s3 = getS3Client();

  try {
    await s3.send(new HeadBucketCommand({ Bucket: config.bucket }));
  } catch (error) {
    const status = error?.$metadata?.httpStatusCode;
    if (status !== 404 && error?.name !== "NotFound") {
      throw error;
    }

    await s3.send(new CreateBucketCommand({ Bucket: config.bucket }));
  }

  bucketReady = true;
}

export async function uploadObject({ key, body, contentType }) {
  await ensureBucket();

  const config = getS3Config();
  const s3 = getS3Client();

  await s3.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return {
    key,
    url: publicUrl(key),
  };
}

export async function deleteObject(key) {
  if (!key) return;

  const config = getS3Config();
  const s3 = getS3Client();

  await s3.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    })
  );
}
