import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import type { EditProfileData, ProfileCardProp } from "../../types/profile";
import api from "../../lib/api";
import { useIdempotencyKey } from "../../hooks/useIdempotencyKey";
import { useAuth } from "../../hooks/useAuth";
import type { AxiosError } from "axios";
import type { ApiErrorResponse, ValidationError } from "../../types/api";
import React, { useState } from "react";
import type { Area } from "react-easy-crop";
import getCroppedImg from "../../utils/cropImage";
import blobUrlToFile from "../../utils/blobToImage";
import { UploadProfileImage } from "./UploadProfileImage";

const EditProfileForm: React.FC<ProfileCardProp> = ({ profile, setIsEdit }) => {
  const [apiErr, setApiErr] = useState<string | ValidationError[] | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [croppedImagePixels, setCroppedImagePixels] = useState<Area | null>(null);
  const idempotencyKey = useIdempotencyKey();
  const { user } = useAuth();

  const methods = useForm<EditProfileData>();

  const cropImage = async () => {
    try {
      if (!image || !croppedImagePixels) {
        return;
      }

      const croppedImageBlob = await getCroppedImg(
        image,
        croppedImagePixels,
        0
      );

      if (!croppedImageBlob) {
        return;
      }

      const file = await blobUrlToFile(croppedImageBlob, `upload-${Date.now()}.png`);

      return file;
    } catch (err) {
      console.error(err);
    }
  }

  const handleEditProfile: SubmitHandler<EditProfileData> = async (data) => {
    try {
      const formData = new FormData();

      const croppedImage = await cropImage();

      if (croppedImage) {
        formData.append("file", croppedImage)
      }

      if (data.bio) {
        formData.append("bio", data.bio);
      }

      formData.append("profileName", profile.username);

      await api.put(`/api/users/${user?.username}/profile/edit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Idempotency-Key': idempotencyKey.get()
        }
      });

    } catch (e) {
      const err = e as AxiosError<ApiErrorResponse>;
      const errorMessage = err.response?.data?.message;

      setApiErr(errorMessage || "Something went wrong. Please try again");
    } finally {
      idempotencyKey.clear();
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-between bg-[#fef8f2] w-full p-5">
      <FormProvider {...methods}>
        <div
          className="flex items-center justify-center min-h-screen px-4"
        >
          <form
            method='post'
            onSubmit={methods.handleSubmit(handleEditProfile)}
            className="w-full max-w-sm flex flex-col gap-5 text-center text-sm text-black"
          >
            <UploadProfileImage
              register={methods.register}
              name="file"
              id="file"
              image={image}
              setImage={setImage}
              setCroppedImagePixels={setCroppedImagePixels}
            />
            <textarea {...methods.register("bio")} name="bio" id="bio"></textarea>
            <button
              className="w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-500 sm:ml-3 sm:w-auto cursor-pointer"
              type="submit"
            >
              Submit
            </button>
            {apiErr && (
              <div className="text-red-600 text-sm">
                {Array.isArray(apiErr)
                  ? apiErr.map((err, i) => <div key={i}>{err.msg}</div>)
                  : apiErr}
              </div>
            )}
          </form>
        </div>
      </FormProvider>
    </div>
  )
}

export default EditProfileForm;