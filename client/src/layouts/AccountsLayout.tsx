import { Outlet } from "react-router-dom";

const AccountsLayout = () => {
  return (
    <div className="bg-cover" style={{ backgroundImage: "url('/Login.png')" }}>
      <Outlet />
    </div>
  );
};

export default AccountsLayout;