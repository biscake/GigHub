import { S3Client } from "@aws-sdk/client-s3";

const {
  R2_REGION,
  R2_ENDPOINT,
  R2_ACCESS_KEY,
  R2_SECRET_KEY,
} = process.env;

if (!R2_REGION || !R2_ENDPOINT || !R2_ACCESS_KEY || !R2_SECRET_KEY) {
  throw new Error("Missing required R2 environment variables");
}

export const r2 = new S3Client({
  region: R2_REGION,
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY
  }
})