export type ImageCropperProps = {
  image: string;
  setCroppedImage: React.Dispatch<React.SetStateAction<string | null>>;
}