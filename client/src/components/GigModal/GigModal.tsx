import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { useEffect, useState } from 'react';
import type { GigModalProp } from '../../types/gig';
import { GigImage } from '../GigImage';
import ApplyGigModal from './ApplyGigModal';
import { useAuth } from '../../hooks/useAuth';

const GigModal: React.FC<GigModalProp> = ({ gig, setSelectedGig, isViewMode = false }) => {
  const [applyModal, setApplyModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

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
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto text-main">
          <div className="flex min-h-full items-end justify-center text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all data-closed:translate-y-4 
                data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-[85%] min-w-[300px] sm:w-full 
                sm:max-w-2xl data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="sm:flex sm:flex-col sm:items-start sm:gap-1">
                <div className="text-center sm:mt-0 bg-[#dac8c0]/80 w-full py-2">
                  <DialogTitle as="h3" className="text-lg font-semibold">
                    {gig?.title}
                  </DialogTitle>
                </div>
                <GigImage imgUrl={gig?.imgUrl} className='p-5' />
                <div className='flex flex-col px-5 pb-3 gap-1 font-bold'>
                  Description:
                  <div className="text-sm md:text-base font-normal">
                    {gig?.description}
                  </div>
                </div>
                <div className="w-full flex flex-row justify-between items-center bg-gray-50 px-4 py-3">
                  <p className="text-center">${gig?.price}</p>
                  <div className="w-full sm:flex sm:flex-row-reverse sm:px-6">
                    {user && user.id !== gig?.authorId && !isViewMode &&
                      <button
                        type="button"
                        onClick={() => setApplyModal(true)}
                        className="cursor-pointer inline-flex w-full justify-center rounded-md bg-[#77D077] px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-[#8fe381] sm:ml-3 sm:w-auto shadow-xs ring-1 ring-gray-300 ring-inset"
                      >
                        Apply
                      </button>}
                    <button
                      type="button"
                      onClick={handleClose}
                      className="cursor-pointer mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-
                        900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
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
      <ApplyGigModal gig={gig} applyModal={applyModal} setApplyModal={setApplyModal} closeModal={handleClose} />
    </>

  )
}

export default GigModal;