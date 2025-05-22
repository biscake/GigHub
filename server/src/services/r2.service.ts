import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../lib/r2";
import { UploadSingleImageToR2Input } from "../types/r2";

export const uploadSingleImageToR2 = async ({ fileBuffer, key, contentType }: UploadSingleImageToR2Input) => {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType
  })

  await r2.send(command);
  return key;
}
