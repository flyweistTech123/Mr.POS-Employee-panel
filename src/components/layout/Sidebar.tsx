import React, { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { persistor } from '@/redux/store';
import { logout } from '@/redux/slice/authSlice';
import toast from 'react-hot-toast';

// Import Zustand store to clear its state and cookie
// ⚠️ UPDATE THIS PATH to match where your zustandStores file is!
import { useUserStore } from '@/store/zustandStores'; 

// RTK Query API slices — reset caches on logout
import { apiSlice } from '@/redux/api/apiSlice';
import { orderHistoryApi } from '@/redux/api/orderHistoryApi';
import { quickOrderApi } from '@/redux/api/quickOrderSlice';
import { userApi } from '@/redux/api/userApi';

// React Icons
import { FiCalendar, FiUserCheck, FiTrendingUp, FiClock } from 'react-icons/fi';

// Existing SVG Icons
import TriaxxLogo from '@/assets/tiaxx_logo.svg';
import QuickOrderIcon from '@/assets/navbar/quick_order_icon.svg';
import TableIcon from '@/assets/navbar/table_icon.svg';
import OrderHistoryIcon from '@/assets/navbar/table_icon.svg';
import TrainingIcon from '@/assets/navbar/user2_icon.svg';
import TeamChatsIcon from '@/assets/navbar/headphone_icon.svg';
import SettingIcon from '@/assets/navbar/settings_icon.svg';
import SignOutIcon from '@/assets/navbar/logout_icon.svg';

// ---------- Nav Config ----------
const navItems = [
  { label: 'Quick order', icon: QuickOrderIcon, path: '/orders', isSvg: true },
  { label: 'Table', icon: TableIcon, path: '/table', isSvg: true },
  { label: 'Order History', icon: OrderHistoryIcon, path: '/order-history', isSvg: true },
  { label: 'Reservations', icon: FiCalendar, path: '/reservations', isSvg: false },
];

const trainingItems = [
  { label: 'Training', icon: TrainingIcon, path: '/training', isSvg: true },
  { label: 'Team chats', icon: TeamChatsIcon, path: '/team-chats', isSvg: true },
  { label: 'Attendance', icon: FiUserCheck, path: '/attendance', isSvg: false },
  { label: 'Sales Performance', icon: FiTrendingUp, path: '/sales-performance', isSvg: false },
  { label: 'Work Shifts', icon: FiClock, path: '/work-shifts', isSvg: false },
];

const bottomItems = [
  { label: 'Setting', icon: SettingIcon, path: '/settings', isSvg: true },
  { label: 'sign out', icon: SignOutIcon, path: '/logout', isSvg: true },
];

// ---------- Component ----------
interface SidebarProps {
  onLogoutClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogoutClick }) => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const zustandLogout = useUserStore((state) => state.logout);

  const isActive = (path: string) => location.pathname.startsWith(path);

  // ---------- Complete Logout ----------
  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://vercel-mr-clement-pos-backend.vercel.app';

    try {
      // 1) Server-side invalidation (Optional)
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
        await fetch(`${API_BASE_URL}/api/v1/user/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        });
      } catch (serverErr) {
        console.warn('Server logout failed:', serverErr);
      }

      // 2) 🚨 BULLETPROOF FIX: Override setItem to block React/Persist from writing the token back to storage during logout.
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        // Block specific keys from being saved
        if (
          key === 'token' || 
          key === 'tokenExp' || 
          key === 'user' || 
          key === 'refreshToken' || 
          key.includes('persist:')
        ) {
          return; 
        }
        return originalSetItem.apply(this, [key, value]);
      };

      // 3) Surgically remove the exact keys you saw in DevTools
      const keysToRemove = [
        'token', 
        'tokenExp', 
        'user', 
        'refreshToken', 
        'admin_language', 
        'selectedCurrency',
        'persist:root'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      // 4) Clear Zustand state
      zustandLogout();

      // 5) Clear Redux Auth state
      dispatch(logout());

      // 6) Reset ALL RTK Query caches
      dispatch(apiSlice.util.resetApiState());
      dispatch(orderHistoryApi.util.resetApiState());
      dispatch(quickOrderApi.util.resetApiState());
      dispatch(userApi.util.resetApiState());

      // 7) Purge Redux Persist
      await persistor.purge();

      // 8) Clear cookies just in case
      document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // 9) Show Toast and Hard Redirect
      toast.success('Logged out successfully!', { duration: 3000, position: 'top-right' });
      
      // Hard redirect forces a full page reload, clearing all React memory
      window.location.href = '/login';

    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Logout failed. Please try again.', { position: 'top-right' });
      setIsLoggingOut(false);
    }
  }, [dispatch, zustandLogout, isLoggingOut]);

  const renderIcon = (item: any, active: boolean) => {
    const size = 20;
    if (item.isSvg) {
      return (
        <img
          src={item.icon}
          alt={item.label}
          className={`h-5 w-5 shrink-0 ${
            active ? 'brightness-0 invert' : 'opacity-70'
          }`}
        />
      );
    }
    const IconComponent = item.icon;
    return (
      <IconComponent
        size={size}
        className={`shrink-0 ${active ? 'text-white' : 'text-gray-700'}`}
      />
    );
  };

  return (
    <aside className="hidden lg:flex flex-col h-screen w-[260px] fixed bg-[#FFF5F9] border-r border-[#0000001A]">
      {/* ---------- Fixed Logo ---------- */}
      <div className="px-6 pt-7 pb-6 shrink-0">
        <Link to="/">
          <img src={TriaxxLogo} alt="TRIAXX logo" className="h-8" />
        </Link>
      </div>

      {/* ---------- Scrollable Middle Section ---------- */}
      <div className="sidebar-scroll flex-1 overflow-y-auto px-4">
        {/* Main Nav */}
        <nav className="flex flex-col gap-1 mb-6">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-full font-medium transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-[#9C27B0] to-[#D32F2F] text-white shadow-md'
                    : 'text-gray-700 hover:bg-[#F3E5F5]'
                }`}
              >
                {renderIcon(item, active)}
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Training Section */}
        <div className="mb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
          Training
        </div>
        <nav className="flex flex-col gap-1 mb-6">
          {trainingItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-full font-medium transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-[#9C27B0] to-[#D32F2F] text-white shadow-md'
                    : 'text-gray-700 hover:bg-[#F3E5F5]'
                }`}
              >
                {renderIcon(item, active)}
                <span className="text-sm leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ---------- Fixed Bottom Section ---------- */}
      <div className="shrink-0 px-4 pb-6 pt-2 flex flex-col gap-1">
        {bottomItems.map((item) => {
          const active = isActive(item.path);

          if (item.label === 'sign out') {
            return (
              <button
                key={item.label}
                onClick={onLogoutClick ?? handleLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-4 px-4 py-3 rounded-full font-medium text-gray-700 hover:bg-[#F3E5F5] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  className="h-5 w-5 opacity-70 shrink-0"
                />
                <span className="text-sm">
                  {isLoggingOut ? 'Signing out…' : 'Sign out'}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-full font-medium transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-[#9C27B0] to-[#D32F2F] text-white shadow-md'
                  : 'text-gray-700 hover:bg-[#F3E5F5]'
              }`}
            >
              {renderIcon(item, active)}
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;