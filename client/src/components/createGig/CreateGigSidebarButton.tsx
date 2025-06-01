import type { CreateGigSidebarButtonProps } from "../../types/gig";

const CreateGigSidebarButton: React.FC<CreateGigSidebarButtonProps> = ({ onClick }) => {
  return (
    <button
      className="inline-flex gap-2 items-center rounded-md px-3 py-1 text-3xl cursor-pointer hover:bg-gray-200"
      onClick={onClick}
    >
      Create Gig
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="#72554a">
        <path d="m19 19v-14h-14v14zm0-16a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2-2v-14c0-1.11.9-2 2-2zm-8 4h2v4h4v2h-4v4h-2v-4h-4v-2h4z" />
      </svg>
    </button>
  )
}

export default CreateGigSidebarButton;