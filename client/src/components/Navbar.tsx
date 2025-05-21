import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-600 text-black px-5 py-5 shadow">
      <div className="flex justify-between items-center">
        <div className="text-4xl font-bold">
          <a href="/">GigHub</a>
        </div>
        {user ? (
          <div className="space-x-4 flex">
            <button onClick={logout} className="text-2xl">Log out</button>
            <p className="text-2xl">{user.username}</p>
          </div>
        ) : (
          <div className="space-x-4">
            <Link className="text-2xl" to="/accounts/login">Login</Link>
            <Link className="text-2xl" to="/accounts/signup">Signup</Link>
          </div>
        )}
        
      </div>
    </nav>
  );
}

export default Navbar;