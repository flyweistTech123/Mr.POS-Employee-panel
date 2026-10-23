// src/pages/auth/ResetPasswordPage.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * The password is now reset on /verify-otp (OTP + new password in one call).
 * This page is kept only so any stale links don't 404 — it redirects
 * users back to the start of the forgot-password flow.
 */
const ResetPasswordPage: React.FC = () => {
  return <Navigate to="/forgot-password" replace />;
};

export default ResetPasswordPage;