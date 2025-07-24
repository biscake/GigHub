import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import type { ConfirmDeleteGigModalProps } from '../../types/mygigs';

const ConfirmDeleteGigModal: React.FC<ConfirmDeleteGigModalProps> = ({ showWarning, handleClose, handleDelete, errorMessage }) => {
  return (
    <Dialog open={showWarning} onClose={handleClose} className="relative z-100">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full justify-center text-center items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all data-closed:translate-y-4 
              data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-[75%] min-w-[200px] sm:w-full max-w-sm
              sm:max-w-sm data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            {!errorMessage &&
              <div className="sm:flex-col sm:items-start">
                <div className='m-5'>
                  <div className="text-center sm:mt-0 w-full py-2 text-lg font-semibold text-gray-900">
                    Delete Gig?
                  </div>
                  <div className='w-full flex justify-center text-base'>
                    All conversations related to this gig will be deleted.
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="submit"
                    onClick={handleDelete}
                    className="inline-flex w-full justify-center rounded-md bg-red-700 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-600 sm:ml-3 sm:w-auto cursor-pointer"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 cursor-pointer
                    shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            }
            {errorMessage &&
              <div className='flex flex-col gap-3 p-5'>
                <div className='text-red-600'>{errorMessage}</div>
                <button
                    type="button"
                    onClick={handleClose}
                    className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 cursor-pointer
                    shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Back
                  </button>
              </div>
            }
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

export default ConfirmDeleteGigModal;