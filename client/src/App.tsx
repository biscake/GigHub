import { Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import AccountsLayout from "./layouts/AccountsLayout";
import AppLayout from "./layouts/AppLayout";
import LoginPage from "./pages/accounts/LoginPage";
import ResetPasswordPage from "./pages/accounts/ResetPasswordPage";
import ResetRequestPage from "./pages/accounts/ResetRequestPage";
import SignupPage from "./pages/accounts/SignupPage";
import "./styles/App.css";

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<AppLayout />}>
        <Route index element={<Dashboard />} />
      </Route>

      <Route path="accounts" element={<AccountsLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="request-reset" element={<ResetRequestPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Route>

    </Routes>
  )
}

export default App;