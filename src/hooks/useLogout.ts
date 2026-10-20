import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { persistor } from '@/redux/store';
import { logout as reduxLogout } from '@/redux/slice/authSlice';
import { useAuthStore } from '@/store/zustandStores'; // 👈 Ensure this matches your Zustand import
import toast from 'react-hot-toast';

// RTK Query API slices
import { apiSlice } from '@/redux/api/apiSlice';
import { orderHistoryApi } from '@/redux/api/orderHistoryApi';
import { quickOrderApi } from '@/redux/api/quickOrderSlice';
import { userApi } from '@/redux/api/userApi';

export const useLogout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const zustandLogout = useAuthStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async (savePassword?: boolean) => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      // 1) BLOCK React/Redux from writing tokens back during teardown
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (
          key === 'token' || 
          key === 'tokenExp' || 
          key === 'user' || 
          key === 'refreshToken' || 
          key.includes('persist:')
        ) {
          return; // Reject the write
        }
        return originalSetItem.apply(this, [key, value]);
      };

      // 2) Clear Zustand (removes 'authToken' cookie)
      zustandLogout();

      // 3) Clear Redux Auth State & RTK Query Caches
      dispatch(reduxLogout());
      dispatch(apiSlice.util.resetApiState());
      dispatch(orderHistoryApi.util.resetApiState());
      dispatch(quickOrderApi.util.resetApiState());
      dispatch(userApi.util.resetApiState());

      // 4) Purge Redux Persist (Awaited so it finishes before redirect)
      await persistor.purge();

      // 5) Wipe Local/Session Storage explicitly
      const keysToRemove = [
        'token', 'tokenExp', 'user', 'refreshToken', 
        'admin_language', 'selectedCurrency', 
        'persist:root', 'persist:auth'
      ];
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      // 6) Wipe ALL possible auth cookies (covers 'token' from authService and 'authToken' from Zustand)
      ['token', 'authToken', 'refreshToken'].forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      });

      // 7) Optional: Save password preference
      if (savePassword) {
        localStorage.setItem('rememberedEmail', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // 8) Show Toast & Hard Redirect
      toast.success('Logged out successfully!', { duration: 1500, position: 'top-right' });
      
      setTimeout(() => {
        // Hard redirect destroys React memory completely
        window.location.replace('/login');
      }, 300);
      
    } catch (err) {
      console.error('Logout failed:', err);
      toast.error('Logout failed. Please try again.');
      setIsLoggingOut(false);
    }
  }, [dispatch, zustandLogout, isLoggingOut]);

  return { handleLogout, isLoggingOut };
};