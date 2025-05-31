import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import type { AxiosError } from 'axios';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import type { ApiErrorResponse, ValidationError } from '../../types/api';
import type { CreateGigFormInputs } from '../../types/form';
import type { ApplyGigFormData, GigModalProp } from '../../types/gig';
import { GigImage } from '../GigCard/GigImage';

const GigModal: React.FC<GigModalProp> = ({ gig, setSelectedGig }) => {
  const [apiErr, setApiErr] = useState<string | ValidationError[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);

  const methods = useForm<CreateGigFormInputs>({ mode: 'onChange' });
  const { user } = useAuth();

  const handleApplyGig: SubmitHandler<ApplyGigFormData> = async (data) => {
    try {
      if (!user) {
        throw new Error("User not logged in");
      }

      const key = idempotencyKey ?? uuidv4();

      if (!idempotencyKey) {
        setIdempotencyKey(key);
      }

      await api.post(`/api/gigs/${gig?.id}/apply`, data, {
        headers: {
          'Idempotency-Key': key
        }
      });
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;

      const errorMessage = error.response?.data?.message;

      setApiErr(errorMessage || "Something went wrong. Please try again");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={gig !== null} onClose={() => setSelectedGig(null)} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all data-closed:translate-y-4 
              data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-[85%] min-w-[300px] sm:w-full 
              sm:max-w-2xl data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="sm:flex sm:flex-col sm:items-start p-5 sm:gap-1">
              <div className="text-center sm:mt-0 bg-gray-200 w-full py-2">
                <DialogTitle as="h3" className="text-lg font-semibold text-gray-900">
                  { gig?.title }
                </DialogTitle>
              </div>
              <div className="w-full flex flex-col justify-center gap-1">
                <GigImage imgUrl={ gig?.imgUrl } />
                <p className="text-sm md:text-base bg-gray-100 p-3 rounded-xl">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </div>
              <div className="w-full flex flex-row justify-between items-center rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-center">${ gig?.price }</p>
                <div className="w-full  sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-500 sm:ml-3 sm:w-auto"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGig(null)}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-
                    900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </div>
              </div>

            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

export default GigModal;