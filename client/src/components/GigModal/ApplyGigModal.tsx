import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import type { AxiosError } from 'axios';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import type { ApiErrorResponse } from '../../types/api';
import type { ApplyGigFormData, ApplyGigModalProp } from '../../types/gig';

const ApplyGigModal: React.FC<ApplyGigModalProp> = ({ gig, applyModal, setApplyModal }) => {
  const [error, setError] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);

  const { handleSubmit, formState: { errors } } = useForm<ApplyGigFormData>({ mode: 'onChange' });
  const { user } = useAuth();

  const handleApplyGig: SubmitHandler<ApplyGigFormData> = async (data) => {
    if (!user) {
      setError("User not logged in");
      return;
    }

    try {
      const key = idempotencyKey ?? uuidv4();

      if (!idempotencyKey) {
        setIdempotencyKey(key);
      }

      await api.post(`/api/gigs/${gig?.id}/apply`, data, {
        headers: {
          'Idempotency-Key': key
        }
      });

      setApplyModal(false);
    } catch (e) {
      const err = e as AxiosError<ApiErrorResponse>;
      const errorMessage = err.response?.data?.message;

      setError(errorMessage || "Something went wrong. Please try again");
    } finally {
      setIdempotencyKey(null);
    }
  }

  const handleClose = () => {
    setError(null);
    setApplyModal(false);
  }

  return (
    <Dialog open={applyModal} onClose={handleClose} className="relative z-50">
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
            <div className="sm:flex sm:flex-col sm:items-start p-5 sm:gap-2">
              <div className="text-center sm:mt-0 bg-gray-200 w-full py-2">
                <DialogTitle as="h3" className="text-lg font-semibold text-gray-900">
                  Apply for {gig?.title}
                </DialogTitle>
              </div>
              <form className="flex flex-col w-full gap-3" onSubmit={handleSubmit(handleApplyGig)}>
                <input
                  type="text"
                  id="message"
                  name="message"
                  className="border-gray-400 border rounded-lg px-2 py-1"
                  placeholder="Short description" />
                {errors.message && <p className="text-center text-red-500 text-sm">{errors.message.message}</p>}
                {error && <p className="text-center text-red-500 text-sm">{error}</p>}
                <div className="w-full sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="submit"
                    className="cursor-pointer inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-500 sm:ml-3 sm:w-auto"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={() => setApplyModal(false)}
                    className="cursor-pointer mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-
                      900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>

              </form>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

export default ApplyGigModal;

