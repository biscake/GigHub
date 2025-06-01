import { NavLink } from "react-router-dom";
import type { SidebarNavLinkProps } from "../../types/sidebar";

const SidebarNavLink: React.FC<SidebarNavLinkProps> = ({ to, children }) => {
  return (
    <NavLink to={to} className={({ isActive }) => `text-3xl hover:bg-gray-200 rounded-md px-3 py-1 ${isActive ? 'bg-gray-200' : ''}`}>
      {children}
    </NavLink>
  )
}

export default SidebarNavLink