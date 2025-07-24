import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import {
  ChevronDownIcon,
  TrashIcon,
} from '@heroicons/react/16/solid'
import type { PostedGigsDropdownMenuProps } from '../../types/mygigs';
import api from '../../lib/api';
import { useIdempotencyKey } from '../../hooks/useIdempotencyKey';
import ConfirmDeleteGigModal from './ConfirmDeleteGigModal';
import { useState } from 'react';
import type { ApiErrorResponse } from '../../types/api';
import type { AxiosError } from 'axios';

const PostedGigsDropdownMenu = ({ gig, refetch }: PostedGigsDropdownMenuProps) => {
  const [showWarning, setShowWarning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const idempotencyKey = useIdempotencyKey();

  const handleDelete = async () => {
    try {
      await api.delete(`/api/gigs/${gig.id}`, {
        headers: {
          'Idempotency-Key': idempotencyKey.get()
        }
      });
      refetch();
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;

      const errorMessage = error.response?.data?.message;

      setErrorMessage(errorMessage || "Something went wrong. Please try again");
    } finally {
      idempotencyKey.clear();
    }
  }

  const handleCloseModal = () => {
    setErrorMessage("");
    setShowWarning(false);
  }

  return (
    <div className="absolute bottom-5 right-5 text-right">
      <Menu>
        <MenuButton className="inline-flex items-center gap-2 rounded-md bg-gray-600/90 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-700">
          Options
          <ChevronDownIcon className="size-4 fill-white/60" />
        </MenuButton>
        <MenuItems
          transition
          anchor="bottom end"
          className="w-52 origin-top-right rounded-xl border border-white/5 p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0 bg-gray-600/90"
        >
          <MenuItem>
            <button
              className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 cursor-pointer text-red-600"
              onClick={() => setShowWarning(true)}
            >
              <TrashIcon className="size-4 fill-red-700" />
              Delete
            </button>
          </MenuItem>
        </MenuItems>
      </Menu>
      <ConfirmDeleteGigModal showWarning={showWarning} handleDelete={handleDelete} handleClose={handleCloseModal} errorMessage={errorMessage} />
    </div>
  )
}

export default PostedGigsDropdownMenu;