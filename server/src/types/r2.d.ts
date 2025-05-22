export type UploadSingleImageToR2Input = {
  fileBuffer: Buffer;
  key: string;
  contentType: string
}