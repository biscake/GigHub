import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { useEffect, useRef, useState } from 'react';
import { GigImage } from '../GigImage';
import type { OngoingGigModalProps } from '../../types/mygigs';
import api from '../../lib/api';
import type { GetGigConversationResponse } from '../../types/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getConversationMeta, storeConversationMeta } from '../../lib/indexeddb';
import { useMessageCache } from '../../hooks/useMessageCache';

const OngoingGigModal: React.FC<OngoingGigModalProps> = ({ gig, setSelectedGig }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { cacheConversationMeta } = useMessageCache();
  const navigate = useNavigate();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  
  useEffect(() => {
    if (gig) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsOpen(true);
    }
  }, [gig]);

  const handleClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsOpen(false);
    timeoutRef.current = setTimeout(() => setSelectedGig(null), 500);
  }

  const startConversation = async () => {
    try {
      if (!gig || !user) return;
      const res = await api.get<GetGigConversationResponse>(`/api/chat/conversations/gigs/${gig.id}/user/${gig.authorId}`);
      const { conversationKey, title, participants } = res.data;

      const existingMeta = await getConversationMeta(user.id, conversationKey) ?? {};
      await storeConversationMeta({
        ...existingMeta,
        title: title,
        conversationKey: conversationKey,
        localUserId: user.id,
        participants: participants
      })

      cacheConversationMeta(conversationKey, { title, participants });
      navigate(`/chat?conversationKey=${conversationKey}`);
    } catch (err) {
      console.error("Failed to get conversation key", err);
    }
  }

  return (
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
                  <button
                    type="button"
                    onClick={startConversation}
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
  )
}

export default OngoingGigModal;