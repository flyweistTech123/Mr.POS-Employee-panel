import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import LeftPanel from '@/components/common/LeftPanel';
import { useForgetPasswordVerifyOtpMutation } from '@/api/apiSlice';

import TriaxxLogoImg from '@/assets/tiaxx_logo.svg';

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

const OTP_LENGTH = 8;

const VerifyOtpPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const email: string = location.state?.email || '';
  const challengeId: string = location.state?.challengeId || '';

  const [verifyOtp] = useForgetPasswordVerifyOtpMutation();

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!challengeId) {
      setError('Session expired. Please restart the flow.');
      return;
    }
    if (otp.length !== OTP_LENGTH) {
      setError(`Please enter the ${OTP_LENGTH}-digit OTP.`);
      return;
    }

    setIsLoading(true);
    try {
      // STEP 2: verify OTP → receive reset_token
      const result = await verifyOtp({ challenge_id: challengeId, otp }).unwrap();
      const resetToken = result?.data?.reset_token;

      if (!resetToken) {
        throw new Error('No reset token returned from server.');
      }

      toast.success('OTP verified successfully!', {
        duration: 4000,
        position: 'top-right',
      });

      // STEP 3: proceed to set-password screen
      navigate('/reset-password', { state: { email, resetToken } });
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Invalid or expired OTP.');
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
            <h3 className="text-2xl lg:text-[32px] font-bold">Verify OTP</h3>
            <p className="text-sm text-[#000000CC] mt-2 font-normal">
              Please enter the authentication code sent to your registered email
            </p>
            {email && (
              <p className="font-bold text-sm text-black mt-1">{email}</p>
            )}
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium mb-1">
                Enter OTP
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={OTP_LENGTH}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH))
                }
                placeholder="Enter OTP here"
                className="w-full px-4 py-3 bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] border-transparent rounded-lg focus:ring-1 focus:ring-purple-600 text-sm placeholder-gray-400"
                required
              />
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            <button
              type="submit"
              disabled={isLoading || otp.length !== OTP_LENGTH}
              className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:opacity-90 disabled:opacity-70"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          <Link
            to="/forgot-password"
            className="mt-4 w-full text-center border border-[#6A1B9A] text-transparent bg-clip-text bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] font-semibold py-3 px-4 rounded-lg hover:opacity-90"
          >
            Back
          </Link>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default VerifyOtpPage;