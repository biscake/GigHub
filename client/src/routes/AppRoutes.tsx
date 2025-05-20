import { Route, Routes } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import ResetRequestPage from "../pages/ResetRequestPage";
import App from "../App"

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/request-reset" element={<ResetRequestPage />} />
      <Route path="/reset-password" element={<App />} />
    </Routes>
  )
}

export default AppRoutes;