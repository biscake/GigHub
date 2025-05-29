import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const AppLayout = () => {
  return (
    <div style={{ backgroundImage: "url('/Home.png')" }} className="bg-cover">
      <Sidebar />
      <Outlet />
    </div>
  );
};

export default AppLayout;