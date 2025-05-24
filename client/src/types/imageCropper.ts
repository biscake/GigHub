import type { Area } from "react-easy-crop";

export type ImageCropperProps = {
  image: string;
  setCroppedImagePixels: React.Dispatch<React.SetStateAction<Area | null>>;
}