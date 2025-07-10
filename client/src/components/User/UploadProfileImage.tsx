import { useState } from "react";
import ImageCropper from "./ProfileCropper";
import type { UploadProfileProps } from "../../types/profile";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

export const UploadProfileImage: React.FC<UploadProfileProps> = ({ register, name, id, image, setImage, setCroppedImagePixels }) => {
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
    if (file && allowedTypes.includes(file.type)) {
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

  const handleFileDelete = () => {
    setImage(null);
    setCroppedImagePixels(null);
  }

  return (
    <div className="w-full flex flex-col items-center">
      {!image
      ? <>
          <label
              htmlFor={id}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-[75%] sm:w-[35%] mt-5 aspect-square flex hover:bg-blue-50 hover:border-blue-400 justify-center items-center border-2 border-dashed rounded-md text-sm text-gray-500 cursor-pointer
                transition-colors ${dragActive ? 'bg-blue-50 border-blue-400' : 'border-gray-300'}`}
            >
            <input
              id={id}
              type="file"
              accept=".jpg, .jpeg, .png, .webp"
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
          <span className="text-xs text-gray-400 mt-1">Only JPG, JPEG, PNG, or WEBP image files are allowed.</span>
        </>
      : <>
          <ImageCropper image={image} setCroppedImagePixels={setCroppedImagePixels} />
          <button
              onClick={handleFileDelete}
              className="mt-2 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded"
          >
            Delete Image
          </button>
        </>
      }
    </div>
  );
}