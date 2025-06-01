import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import CreateGigFormModal from "../createGig/CreateGigModal";
import SidebarNavLink from "./SidebarNavLink";
import CreateGigSidebarButton from "../createGig/CreateGigSidebarButton";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isCreateGigModalOpen, setIsCreateGigModalOpen] = useState<boolean>(false);
  const location = useLocation();

  return (
    <aside className="w-[15vw] min-w-[350px] hidden md:block text-[1rem] font-mono font-bold border-r border-white/50 bg-[#fff8f2]">
      <div className="h-full flex flex-col justify-between gap-5 p-5">
        <div className="flex flex-col gap-5">
          <Link to="/" className="text-5xl hover:link-hover">
            GigHub
          </Link>
          <SidebarNavLink to="/">
            Home
          </SidebarNavLink>
          {user &&
            <SidebarNavLink to="applications">
              Applications
            </SidebarNavLink>
          }
          {user && location.pathname === '/' &&
            <CreateGigSidebarButton onClick={() => setIsCreateGigModalOpen(true)}/>
          }
          {user && <CreateGigFormModal isCreateGigModalOpen={isCreateGigModalOpen} setIsCreateGigModalOpen={setIsCreateGigModalOpen} />}
        </div>
        {user ? (
          <div className="space-x-4 flex flex-col gap-5 items-start">
            <SidebarNavLink to={`/${user.username}/profile`}>
              {user.username}
            </SidebarNavLink>
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