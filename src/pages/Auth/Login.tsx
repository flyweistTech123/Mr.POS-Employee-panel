import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import {
  useLoginEmployeeMutation,
  useVerifyEmployeeOtpMutation,
  useResendEmployeeOtpMutation,
} from '@/api/apiSlice';
import { setCredentials } from '@/redux/slice/authSlice';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import LeftPanel from '@/components/common/LeftPanel';

import TriaxxLogoImg from '@/assets/tiaxx_logo.svg';
import EyeIconImg from '@/assets/eye_icon.svg';
import EyeSlashIconImg from '@/assets/eye-password-hide.svg';
import FacebookIconImg from '@/assets/auth/facebook.svg';
import GoogleIconImg from '@/assets/auth/google.svg';
import AppleIconImg from '@/assets/auth/apple.svg';

type Tab = 'Restaurant' | 'Employee' | 'Admin';
type Step = 'credentials' | 'otp';

const OTP_LENGTH = 8; // backend requires exactly 8 digits

const extractErrorMessage = (err: any, fallback: string): string => {
  const data = err?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.detail === 'string') return data.detail;
  if (Array.isArray(data?.non_field_errors) && data.non_field_errors[0]) {
    return data.non_field_errors[0];
  }
  // Handle DRF-style { errors: [{ msg, path }] }
  if (Array.isArray(data?.errors) && data.errors[0]?.msg) {
    return data.errors[0].msg;
  }
  for (const key of Object.keys(data)) {
    const val = (data as any)[key];
    if (Array.isArray(val) && val[0]) return `${key}: ${val[0]}`;
    if (typeof val === 'string') return `${key}: ${val}`;
  }
  return fallback;
};

const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Employee');
  const [step, setStep] = useState<Step>('credentials');

  // Credentials
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // OTP
  const [otp, setOtp] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [employeeLoginCode, setEmployeeLoginCode] = useState('');
  const [expiresIn, setExpiresIn] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [loginEmployee] = useLoginEmployeeMutation();
  const [verifyEmployeeOtp] = useVerifyEmployeeOtpMutation();
  const [resendEmployeeOtp] = useResendEmployeeOtpMutation();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // OTP countdown
  useEffect(() => {
    if (step !== 'otp') return;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setExpiresIn((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [step]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  /* STEP 1: submit credentials → request OTP */
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const result = await loginEmployee({
        employee_login_code: employeeId,
        password,
      }).unwrap();

      if (result.data?.requires_otp) {
        setChallengeId(result.data.challenge_id);
        setMaskedEmail(result.data.email);
        setEmployeeLoginCode(result.data.employee_login_code);
        setExpiresIn(result.data.expires_in_seconds);
        setOtp('');
        setStep('otp');

        toast.success(result.message || 'OTP sent to your email', {
          duration: 4000,
          position: 'top-right',
        });
      } else {
        toast.error('Unexpected response from server.', {
          duration: 4000,
          position: 'top-right',
        });
      }
    } catch (err: any) {
      console.error('Login error:', err?.status, err?.data, err);
      toast.error(
        extractErrorMessage(err, 'Login failed. Please try again.'),
        { duration: 5000, position: 'top-right' },
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* STEP 2: verify OTP → set credentials */
  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (otp.length !== OTP_LENGTH) {
      toast.error(`Please enter the ${OTP_LENGTH}-digit OTP.`, {
        duration: 4000,
        position: 'top-right',
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await verifyEmployeeOtp({
        challenge_id: challengeId,
        otp,
      }).unwrap();

      // If you want the slice's onQueryStarted to be the single source of
      // truth for auth state, remove the next dispatch block. Both work.
      dispatch(
  setCredentials({
    token: data.data.token,
    user: {
      ...data.data.user,
      id: data.data.user._id,
      name: data.data.user.Name,
    },
  }),
);

      toast.success('Login successful!', {
        duration: 4000,
        position: 'top-right',
      });

      navigate('/');
    } catch (err: any) {
      console.error('OTP verify error:', err?.status, err?.data, err);
      toast.error(
        extractErrorMessage(err, 'Invalid or expired OTP. Please try again.'),
        { duration: 5000, position: 'top-right' },
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* Resend OTP */
  const handleResendOtp = async () => {
    if (resendLoading || expiresIn > 0) return;
    setResendLoading(true);

    try {
      const result = await resendEmployeeOtp({
        employee_login_code: employeeId,
        password,
      }).unwrap();

      if (result.data?.requires_otp) {
        setChallengeId(result.data.challenge_id);
        setMaskedEmail(result.data.email);
        setEmployeeLoginCode(result.data.employee_login_code);
        setExpiresIn(result.data.expires_in_seconds);
        setOtp('');

        toast.success('OTP resent successfully!', {
          duration: 4000,
          position: 'top-right',
        });
      }
    } catch (err: any) {
      console.error('Resend OTP error:', err?.status, err?.data, err);
      toast.error(
        extractErrorMessage(err, 'Failed to resend OTP.'),
        { duration: 5000, position: 'top-right' },
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleSocialLogin = async (
    provider: 'facebook' | 'google' | 'apple',
  ) => {
    setIsLoading(true);
    try {
      toast.success(`${provider} login successful!`, {
        duration: 4000,
        position: 'top-right',
      });
    } catch {
      toast.error(`An error occurred during ${provider} login.`, {
        duration: 4000,
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const backToCredentials = () => {
    setStep('credentials');
    setOtp('');
    setChallengeId('');
    setMaskedEmail('');
    setEmployeeLoginCode('');
    setExpiresIn(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div
      className={`flex min-h-screen items-center justify-center ${
        isMobile ? 'gradient-background-mobile' : 'gradient-background'
      } p-4 lg:p-0`}
    >
      <div className="flex w-full max-w-sm flex-col rounded-3xl bg-white p-6 shadow-2xl lg:h-screen lg:max-w-none lg:flex-row lg:p-0 lg:shadow-none lg:rounded-none">
        <LeftPanel />

        <div className="w-full lg:w-2/5  lg:p-10 xl:px-20 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl lg:text-2xl font-bold">Sign in</h2>
            <img src={TriaxxLogoImg} alt="TRIAXX Logo" className="h-6 lg:h-8" />
          </div>

          <div className="text-center mb-2">
            <h3 className="text-2xl lg:text-[32px] font-bold">
              {step === 'otp' ? 'Verify OTP' : 'Welcome Back!'}
            </h3>
            <p className="text-sm text-[#000000CC] mt-1 font-normal">
              {step === 'otp'
                ? `Enter the ${OTP_LENGTH}-digit code sent to ${maskedEmail}`
                : 'Login to access your Triaxx Account'}
            </p>
          </div>

          {step === 'credentials' && (
            <div className="flex justify-center space-x-2 sm:space-x-6 my-6 lg:my-8 border-b border-gray-200">
              {(['Restaurant', 'Employee', 'Admin'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-1 sm:px-2 text-base font-bold focus:outline-none
                    ${
                      activeTab === tab
                        ? 'bg-clip-text text-transparent text-primary-gradient border-b-2 border-red-600'
                        : 'text-[#00000099] hover:text-gray-800'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* CREDENTIALS STEP */}
          {activeTab === 'Employee' && step === 'credentials' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="employeeId"
                  className="block text-sm font-medium mb-1"
                >
                  Employee id
                </label>
                <input
                  id="employeeId"
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter id"
                  className="w-full px-4 py-3 bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] border-transparent rounded-lg focus:ring-1 focus:ring-purple-600 focus:border-purple-600 focus:bg-white text-sm placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#00000099] hover:cursor-pointer"
                  >
                    Forget Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Password"
                    className="w-full px-4 py-3 bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] border-transparent rounded-lg focus:ring-1 focus:ring-purple-600 focus:border-purple-600 focus:bg-white text-sm placeholder-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                  >
                    <img
                      src={showPassword ? EyeSlashIconImg : EyeIconImg}
                      alt="Toggle password visibility"
                      className="w-5 h-5"
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-70"
              >
                {isLoading ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          )}

          {/* OTP STEP */}
          {activeTab === 'Employee' && step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 mt-6">
              {employeeLoginCode && (
                <div className="text-center text-xs text-gray-500">
                  Employee Code: <strong>{employeeLoginCode}</strong>
                </div>
              )}

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
                    setOtp(
                      e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH),
                    )
                  }
                  placeholder={'-'.repeat(OTP_LENGTH)}
                  className="w-full px-4 py-3 text-center tracking-[0.5em] text-lg bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] border-transparent rounded-lg focus:ring-1 focus:ring-purple-600 focus:border-purple-600 focus:bg-white placeholder-gray-400"
                  required
                />
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>
                    Expires in:{' '}
                    <strong className={expiresIn < 60 ? 'text-red-500' : ''}>
                      {formatTime(expiresIn)}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={expiresIn > 0 || resendLoading}
                    className="text-purple-600 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {resendLoading ? 'Sending...' : 'Resend OTP'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== OTP_LENGTH}
                className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-70"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={backToCredentials}
                className="w-full text-sm text-gray-600 hover:underline"
              >
                ← Back to login
              </button>
            </form>
          )}

          {/* Other tabs placeholder */}
          {activeTab !== 'Employee' && step === 'credentials' && (
            <div className="text-center py-12 text-gray-500">
              {activeTab} login form will be here.
            </div>
          )}

          {/* Sign up + Social */}
          {activeTab === 'Employee' && step === 'credentials' && (
            <>
              <p className="mt-6 text-sm text-center text-gray-700">
                Don't have an account?{' '}
                <a
                  href="#"
                  className="font-medium text-[#FF8682] hover:cursor-pointer"
                >
                  Sign up
                </a>
              </p>

              <div className="mt-6 flex items-center">
                <hr className="w-full border-gray-300" />
                <span className="px-2 text-xs text-gray-500 whitespace-nowrap">
                  Or login with
                </span>
                <hr className="w-full border-gray-300" />
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('facebook')}
                  className="w-full flex items-center justify-center py-4 border border-[#515DEF] rounded-lg shadow-sm bg-white hover:bg-gray-50"
                >
                  <img src={FacebookIconImg} alt="Facebook" className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className="w-full flex items-center justify-center py-4 border border-[#515DEF] rounded-lg shadow-sm bg-white hover:bg-gray-50"
                >
                  <img src={GoogleIconImg} alt="Google" className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('apple')}
                  className="w-full flex items-center justify-center py-4 border border-[#515DEF] rounded-lg shadow-sm bg-white hover:bg-gray-50"
                >
                  <img src={AppleIconImg} alt="Apple" className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

export default LoginPage;