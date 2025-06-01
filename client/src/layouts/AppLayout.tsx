import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";

const AppLayout = () => {
  return (
    <div className="flex w-screen h-screen bg-center text-main p-4 bg-[#faefe5]">
      <div className="rounded-3xl flex flex-1 gap-[2px] bg-[#faefe5] overflow-hidden">
        <Sidebar />
        <Outlet />
      </div>
    </div>
  );
};
//rounded-2xl bg-red-300 border-2 border-black flex flex-1 gap-[2px]
export default AppLayout;