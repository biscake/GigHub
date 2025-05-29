import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";

const AppLayout = () => {
  return (
    <div style={{ backgroundImage: "url('/Home.png')" }} className="bg-cover w-screen h-screen bg-center">
      <Sidebar />
      <Outlet />
    </div>
  );
};

export default AppLayout;