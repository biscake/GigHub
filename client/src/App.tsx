import { Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard";
import LoginForm from "./components/forms/LoginForm";
import ResetPasswordForm from "./components/forms/ResetPasswordForm";
import ResetRequestForm from "./components/forms/ResetRequestForm";
import SignupForm from "./components/forms/SignupForm";
import AccountsLayout from "./layouts/AccountsLayout";
import AppLayout from "./layouts/AppLayout";
import UserProfile from "./components/User/UserProfile";
import GigApplicationPage from "./pages/GigApplicationPage";
import "./styles/App.css";

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path='applications' element={<GigApplicationPage />} />
      </Route>

      <Route path="accounts" element={<AccountsLayout />}>
        <Route path="login" element={<LoginForm />} />
        <Route path="signup" element={<SignupForm />} />
        <Route path="request-reset" element={<ResetRequestForm />} />
        <Route path="reset-password" element={<ResetPasswordForm />} />
      </Route>

      <Route path=":username" element={<AppLayout />}>
        <Route path="profile" element={<UserProfile />} />
      </Route>

    </Routes>
  )
}

export default App;