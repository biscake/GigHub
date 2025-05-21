import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[20vw] hidden md:block bg-black text-white text-[1rem] font-mono font-bold border-r-2 border-red-200">
      <div className="h-full flex flex-col justify-between gap-5 p-5">
        <div className="flex flex-col gap-5">
          <div className="text-4xl">
            <a href="/">
              GigHub
            </a>
          </div>
          <div className="text-2xl">
            <a href="/">
              Home
            </a>
          </div>
          <div className="text-2xl">
            Gigs (TODO)
          </div>
          <div className="text-2xl">
            Search (TODO)
          </div>
        </div>
        {user ? (
          <div className="space-x-4 flex flex-col">
            <p className="text-2xl">{user.username}</p>
            <button onClick={logout} className="text-2xl">Log out</button>
          </div>
        ) : (
          <div className="space-x-4 flex flex-col gap-5">
            <Link className="text-2xl" to="/Login">Login</Link>
            <Link className="text-2xl" to="/Signup">Signup</Link>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;