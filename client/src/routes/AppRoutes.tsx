import { Route, Routes } from "react-router-dom";
import App from "../App";
import CreateGigForm from "../components/forms/CreateGigForm";
import AccountsLayout from "../layouts/accountsLayout";
import GigsLayout from "../layouts/gigsLayout";
import LoginPage from "../pages/accounts/LoginPage";
import ResetPasswordPage from "../pages/accounts/ResetPasswordPage";
import ResetRequestPage from "../pages/accounts/ResetRequestPage";
import SignupPage from "../pages/accounts/SignupPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route index element={<App />} />

      <Route path="accounts" element={<AccountsLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="request-reset" element={<ResetRequestPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route path="gigs" element={<GigsLayout />}>
        <Route path="create" element={<CreateGigForm />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;