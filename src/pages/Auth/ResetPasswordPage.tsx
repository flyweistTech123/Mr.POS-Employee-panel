import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import LeftPanel from '@/components/common/LeftPanel';
import { useForgetPasswordResetMutation } from '@/api/apiSlice';

import TriaxxLogoImg from '@/assets/tiaxx_logo.svg';
import EyeIconImg from '@/assets/eye_icon.svg';
import EyeSlashIconImg from '@/assets/eye-password-hide.svg';

const extractErrorMessage = (err: any, fallback: string): string => {
  const data = err?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.detail === 'string') return data.detail;
  for (const key of Object.keys(data)) {
    const val = (data as any)[key];
    if (Array.isArray(val) && val[0]) return `${key}: ${val[0]}`;
    if (typeof val === 'string') return `${key}: ${val}`;
  }
  return fallback;
};

const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const resetToken: string = location.state?.resetToken || '';

  const [resetPassword] = useForgetPasswordResetMutation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!resetToken) {
      setError('Session expired. Please restart the flow.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      // STEP 3: set new password
      await resetPassword({
        reset_token: resetToken,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }).unwrap();

      toast.success('Password updated successfully!', {
        duration: 4000,
        position: 'top-right',
      });

      navigate('/password-updated');
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Failed to reset password.');
      setError(msg);
      toast.error(msg, { duration: 5000, position: 'top-right' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center gradient-background-mobile p-4 lg:p-0 lg:bg-[#F8F8F8]">
      <div className="flex w-full max-w-sm flex-col rounded-3xl bg-white p-6 shadow-2xl lg:h-screen lg:max-w-none lg:flex-row lg:p-0 lg:shadow-none lg:rounded-none">
        <LeftPanel />

        <div className="w-full lg:w-2/5 lg:p-10 xl:px-20 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-xl lg:text-2xl font-bold">Sign in</h2>
            <img src={TriaxxLogoImg} alt="TRIAXX Logo" className="h-6 lg:h-8" />
          </div>

          <div className="text-center mb-8">
            <h3 className="text-2xl lg:text-[32px] font-bold">Set New Password</h3>
            <p className="text-sm text-[#000000CC] mt-2 font-normal">
              Choose a strong password for your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] border-transparent rounded-lg focus:ring-1 focus:ring-purple-600 focus:bg-white text-sm placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                >
                  <img
                    src={showNew ? EyeSlashIconImg : EyeIconImg}
                    alt="Toggle password visibility"
                    className="w-5 h-5"
                  />
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] border-transparent rounded-lg focus:ring-1 focus:ring-purple-600 focus:bg-white text-sm placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                >
                  <img
                    src={showConfirm ? EyeSlashIconImg : EyeIconImg}
                    alt="Toggle password visibility"
                    className="w-5 h-5"
                  />
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:opacity-90 disabled:opacity-70 mt-2"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          <Link
            to="/login"
            className="mt-4 w-full text-center border border-[#6A1B9A] text-transparent bg-clip-text bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] font-semibold py-3 px-4 rounded-lg hover:opacity-90"
          >
            Back to Login
          </Link>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default ResetPasswordPage;