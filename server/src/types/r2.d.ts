export type UploadSingleImageToR2Input = {
  fileBuffer: Buffer;
  key: string;
  contentType: string
}

export type DeleteSingleImageFromR2Input = {
  key: string;
}