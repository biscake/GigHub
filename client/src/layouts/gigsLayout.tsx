import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const GigsLayout = () => {
  return (
    <>
      <Sidebar />
      <Navbar />
      <Outlet />
    </>
  );
};

export default GigsLayout;