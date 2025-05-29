import { Button } from "@headlessui/react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import CreateGigFormModal from "../createGig/CreateGigModal";
import SidebarNavLink from "./SidebarNavLink";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isCreateGigModalOpen, setIsCreateGigModalOpen] = useState<boolean>(false);
  const location = useLocation();

  function openCreateGigModal() {
    setIsCreateGigModalOpen(true);
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[20vw] hidden md:block text-white text-[1rem] font-mono font-bold border-r border-white/50 backdrop-blur-sm">
      <div className="h-full flex flex-col justify-between gap-5 p-5">
        <div className="flex flex-col gap-5">
          <Link to="/" className="text-4xl hover:link-hover">
            GigHub
          </Link>
          <SidebarNavLink to="/">
            Home
          </SidebarNavLink>
          <SidebarNavLink to="applications">
            Applications
          </SidebarNavLink>
          <div className="text-2xl">
            Search (TODO)
          </div>
          {user && location.pathname === '/' &&
            <Button
              className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 font-semibold text-white text-xl
                focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700 cursor-pointer"
              onClick={openCreateGigModal}
            >
              Create Gig
            </Button>
          }
          <CreateGigFormModal isCreateGigModalOpen={isCreateGigModalOpen} setIsCreateGigModalOpen={setIsCreateGigModalOpen} />
        </div>
        {user ? (
          <div className="space-x-4 flex flex-col gap-5 items-start">
            <p className="text-2xl">{user.username}</p>
            <button onClick={logout} className="text-2xl hover:link-hover">Log out</button>
          </div>
        ) : (
          <div className="space-x-4 flex flex-col gap-5 items-start">
            <Link className="text-2xl" to="/accounts/login">Login</Link>
            <Link className="text-2xl" to="/accounts/signup">Signup</Link>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;