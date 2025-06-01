import { useState } from "react";
import type { Area, Point } from "react-easy-crop";
import Cropper from "react-easy-crop";
import type { ImageCropperProps } from "../../types/imageCropper";

const ImageCropper: React.FC<ImageCropperProps> = ({ image, setCroppedImagePixels }) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const onCropComplete = async (_croppedArea: Area, croppedImagePixels: Area) => {
      setCroppedImagePixels(croppedImagePixels);
  }

  return (
    <>
      <div className="relative w-full max-w-[900px] aspect-[4/3] mx-auto"> {/* cropper container */}
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
    </>
  )
}

export default ImageCropper;