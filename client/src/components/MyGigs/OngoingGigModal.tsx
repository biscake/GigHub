import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { GigImage } from '../GigImage';
import type { OngoingGigModalProps } from '../../types/mygigs';

const OngoingGigModal: React.FC<OngoingGigModalProps> = ({ gig, setSelectedGig }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (gig) {
      setIsOpen(true);
    }
  }, [gig]);

  const handleClose = () => {
    setIsOpen(false);
    const timeout = setTimeout(() => setSelectedGig(null), 500);

    return () => clearTimeout(timeout);
  }

  return (
    <>
      <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
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
                    {gig?.title}
                  </DialogTitle>
                </div>
                <div className="w-full flex flex-col justify-center gap-1 rounded-xl">
                  <GigImage imgUrl={gig?.imgUrl} />
                  <p className="text-sm md:text-base bg-gray-100 p-3 rounded-xl">
                    {gig?.description}
                  </p>
                </div>
                
                <div className="w-full flex flex-row justify-between items-center rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-center">${gig?.price}</p>
                  <div className="w-full sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="cursor-pointer mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-
                        900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    >
                      Message Author
                    </button>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>

  )
}

export default OngoingGigModal;