import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { ServiceError } from "../errors/service-error";
import { r2 } from "../lib/r2";
import { DeleteSingleImageFromR2Input, UploadSingleImageToR2Input } from "../types/r2";

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

export const deleteSingleImageFromR2 = async ({ key }: DeleteSingleImageFromR2Input) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
    })

    await r2.send(command);
  } catch (err) {
    throw new ServiceError("R2", "Failed to delete image from R2");
  }
}
