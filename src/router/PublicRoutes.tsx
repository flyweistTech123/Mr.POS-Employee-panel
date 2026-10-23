import { Route, Routes, Navigate } from "react-router-dom";
import Login from "@/pages/Auth/Login";
import ForgotPasswordPage from "@/pages/Auth/ForgotPassword";
import VerifyOtpPage from "@/pages/Auth/VerifyOtpPage";
import ResetPasswordPage from "@/pages/Auth/ResetPasswordPage";
import PasswordChanged from "@/pages/Auth/PasswordChanged";

export const PublicRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/verify-otp" element={<VerifyOtpPage />} />
       <Route path="/password-updated" element={<PasswordChanged />} />
    {/* <Route path="/reset-password" element={<ResetPasswordPage />} /> */}
    <Route path="/*" element={<Navigate to="/login" replace />} />
  </Routes>
); 