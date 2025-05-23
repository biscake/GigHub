import { useState } from "react";
import type { UploadFileProps } from "../../types/inputProps";
import ImageCropper from "../ImageCropper";

export const UploadFile: React.FC<UploadFileProps> = ({ register, name, id, image, setImage, setCroppedImage }) => {
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const setImageFile = (file: File | undefined) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    setImageFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageFile(file);
  };

  return (
    <div className="w-full">
      {!image
        ? <label
            htmlFor={id}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex items-center justify-center border-2 border-dashed rounded-md p-6 text-sm text-gray-500 cursor-pointer ${dragActive ? 'bg-blue-50 border-blue-400' : 'border-gray-300'
            }`}
          >
          <input
            id={id}
            type="file"
            accept="image/*"
            {...register(name)}
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center space-y-2">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <p>Upload or drag & drop your file</p>
          </div>
        </label>
      :
        <div>
          <ImageCropper image={image} setCroppedImage={setCroppedImage} />
        </div>
      }
    </div>
  );
}

