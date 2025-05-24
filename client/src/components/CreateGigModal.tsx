import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import type { AxiosError } from 'axios';
import { useState } from 'react';
import type { Area } from 'react-easy-crop';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';
import type { ApiErrorResponse, ValidationError } from '../types/api';
import type { CreateGigFormInputs } from '../types/form';
import type { CreateGigModalProps } from '../types/modal';
import blobUrlToFile from '../utils/blobToImage';
import getCroppedImg from '../utils/cropImage';
import CreateGigForm from './forms/CreateGigForm';

const CreateGigFormModal: React.FC<CreateGigModalProps> = ({ isCreateGigModalOpen, setIsCreateGigModalOpen }) => {
  const [apiErr, setApiErr] = useState<string | ValidationError[] | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [croppedImagePixels, setCroppedImagePixels] = useState<Area | null>(null);

  const methods = useForm<CreateGigFormInputs>({ mode: 'onChange' });
  const { user } = useAuth();

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

  const submitCredential: SubmitHandler<CreateGigFormInputs> = async (data) => {
    try {
      if (!user) {
        throw new Error("User not logged in");
      }

      const formData = new FormData();

      const croppedImage = await cropImage();

      if (croppedImage) {
        formData.append("file", croppedImage);
      }
      
      formData.append("title", data.title);
      formData.append("price", String(data.price));
      formData.append("description", data.description);
      formData.append("authorId", String(user.id));

      await api.post('/api/gigs/create', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setIsCreateGigModalOpen(false);
    } catch (err) {
      console.error(err)
      const error = err as AxiosError<ApiErrorResponse>;

      const validationErrors = error.response?.data?.errors;

      const errorMessage = error.response?.data?.message;

      setApiErr(validationErrors || errorMessage || "Something went wrong. Please try again");
    }
  }

  return (
    <Dialog open={isCreateGigModalOpen} onClose={() => setIsCreateGigModalOpen(false)} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 
              data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-[85%] min-w-[300px] sm:w-full 
              sm:max-w-2xl data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="sm:flex-col sm:items-start">
              <div className="text-center sm:mt-0 bg-gray-200 w-full py-2">
                <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                    Create Gig
                </DialogTitle>
              </div>
              <div className='w-full flex justify-center'>
                <CreateGigForm
                  apiErr={apiErr}
                  methods={methods}
                  image={image}
                  setImage={setImage}
                  setCroppedImagePixels={setCroppedImagePixels}
                />
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="submit"
                  onClick={methods.handleSubmit(submitCredential)}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateGigModalOpen(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-
                    900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

export default CreateGigFormModal;
