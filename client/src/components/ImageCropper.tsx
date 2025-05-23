import { useState } from "react";
import type { Area, Point } from "react-easy-crop";
import Cropper from "react-easy-crop";
import type { ImageCropperProps } from "../types/imageCropper";
import getCroppedImg from "../utils/cropImage";

const ImageCropper: React.FC<ImageCropperProps> = ({ image, setCroppedImage }) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const onCropComplete = async (_croppedArea: Area, croppedAreaPixels: Area) => {
    try {
      const croppedImage = await getCroppedImg(
        image,
        croppedAreaPixels,
        0
      );

      setCroppedImage(croppedImage);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <div className="relative w-full h-64"> {/* cropper container */}
        <Cropper 
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={4 / 3}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />
      </div>
      <div className="flex flex-col"> {/* controls container */}
        <div className="flex flex-col"> {/* slider container*/}
          {/* slider component here */}
        </div>
      </div>
    </div>
  )
}

export default ImageCropper;