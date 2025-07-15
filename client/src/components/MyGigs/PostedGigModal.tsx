import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useMessageCache } from '../../hooks/useMessageCache';
import api from '../../lib/api';
import { getConversationMeta, storeConversationMeta } from '../../lib/indexeddb';
import type { GetGigConversationResponse } from '../../types/api';
import type { ApplicationListItemProps, PostedGigsModalProps } from '../../types/mygigs';

const PostedGigsModal: React.FC<PostedGigsModalProps> = ({ gig, setSelectedGig, applications, setApplications }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { cacheConversationMeta } = useMessageCache();
  const navigate = useNavigate();

  useEffect(() => {
    if (gig) {
      setIsOpen(true);
    }
  }, [gig]);

  const handleClose = () => {
    setIsOpen(false);
    const timeout = setTimeout(() => {
      setSelectedGig(null);
      setApplications(null);
    }, 500);

    return () => clearTimeout(timeout);
  }

  const startConversation = async (otherUserId: number) => {
    try {
      if (!gig || !user) return;
      const res = await api.get<GetGigConversationResponse>(`/api/chat/conversations/gigs/${gig.id}}/user/${otherUserId}`);
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
    <>
      <Dialog open={isOpen} onClose={handleClose} className="relative z-50 text-main">
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
              <DialogTitle className="pt-6 px-6 font-bold text-xl"> 
                Current Gig Takers
              </DialogTitle>
              <div className="sm:flex sm:flex-col sm:items-start p-5 sm:gap-1">                
                <div className="w-full flex flex-row justify-between items-center px-4 py-3">
                  <div className="w-full">
                    {
                      applications && applications.length > 0
                        ? applications.map((app, i) => <ApplicationListItem key={i} username={app.user.username} onClick={() => startConversation(app.user.id)} />)
                        : "No ongoing applicants."
                    }
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

const ApplicationListItem: React.FC<ApplicationListItemProps> = ({ username, onClick }) => {
  return (
    <div className='flex'>
      <div className='flex-1'>
        <NavLink to={`/${username}/profile`} className='flex-1 hover:underline'>{username}</NavLink>
      </div>
      <button
        type="button"
        onClick={onClick}
        className="cursor-pointer mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-
          900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
      >
        Message user
      </button>
    </div>
  )
}

export default PostedGigsModal;