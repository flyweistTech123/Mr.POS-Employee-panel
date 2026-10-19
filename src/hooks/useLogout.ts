// src/hooks/useLogout.ts
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import type { AppDispatch } from '@/redux/store';
import { persistor } from '@/redux/store';
import { logout } from '@/redux/slice/authSlice';

import { apiSlice } from '@/redux/api/apiSlice';
import { orderHistoryApi } from '@/redux/api/orderHistoryApi';
import { quickOrderApi } from '@/redux/api/quickOrderSlice';
import { userApi } from '@/redux/api/userApi';

// ⚠️ If you call a /logout endpoint, import your api client here.
// import api from '@/services/api';

export const useLogout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      // 1) Best-effort server-side invalidation — never block logout on it
      // try {
      //   await api.post('/auth/logout');
      // } catch {
      //   /* ignore */
      // }

      // 2) Clear Redux auth state
      dispatch(logout());

      // 3) Reset ALL RTK Query caches (prevents data leak between users)
      dispatch(apiSlice.util.resetApiState());
      dispatch(orderHistoryApi.util.resetApiState());
      dispatch(quickOrderApi.util.resetApiState());
      dispatch(userApi.util.resetApiState());

      // 4) Flush + purge persisted storage (sessionStorage)
      await persistor.flush();
      await persistor.purge();

      // 5) Clear any stray client-side tokens (in case axios interceptors use them)
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      // Don't call sessionStorage.clear() — redux-persist uses sessionStorage

      // 6) Feedback + redirect (replace: true → no back-button to protected pages)
      toast.success('Logged out successfully!', {
        duration: 4000,
        position: 'top-right',
      });

      navigate('/login', { replace: true });
    } catch (err) {
      toast.error('Logout failed. Please try again.', {
        position: 'top-right',
      });
    } finally {
      setIsLoggingOut(false);
    }
  }, [dispatch, navigate, isLoggingOut]);

  return { handleLogout, isLoggingOut };
};