import { Outlet } from "react-router-dom";

const AccountsLayout = () => {
  return (
    <div className="bg-cover w-screen h-screen bg-center" style={{ backgroundImage: "url('/Login.png')" }}>
      <Outlet />
    </div>
  );
};

export default AccountsLayout;