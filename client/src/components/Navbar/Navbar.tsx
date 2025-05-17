import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gray-600 text-black px-5 py-1 shadow">
      <div className="flex justify-between items-center">
        <div className="text-xl font-bold">
          <a href="/">GigHub</a>
        </div>
        <div className="space-x-4">
          <Link to="/Login">Login</Link>
          <Link to="/Signup">Signup</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;