import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiCalendar, FiUserCheck, FiTrendingUp, FiClock } from 'react-icons/fi';

// Sidebar PNG icons
import quickOrder from '@/assets/sidebar/quickorder.png';
import table from '@/assets/sidebar/table.png';
import shift from '@/assets/sidebar/shift.png';
import training from '@/assets/sidebar/training.png';
import reservation from '@/assets/sidebar/reservation.png';
import logoutIcon from '@/assets/sidebar/logout.png';
import chat from '@/assets/sidebar/chat.png';
import calender from '@/assets/sidebar/calendar.png';
import setting from '@/assets/sidebar/settings.png';
import saleperfomance from '@/assets/sidebar/sp.png';

import TriaxxLogo from '@/assets/tiaxx_logo.svg';
import QuickOrderIcon from '@/assets/navbar/quick_order_icon.svg';
import TableIcon from '@/assets/navbar/table_icon.svg';
import OrderHistoryIcon from '@/assets/navbar/table_icon.svg';
import TrainingIcon from '@/assets/navbar/user2_icon.svg';
import TeamChatsIcon from '@/assets/navbar/headphone_icon.svg';
import SettingIcon from '@/assets/navbar/settings_icon.svg';
import SignOutIcon from '@/assets/navbar/logout_icon.svg';

const navItems = [
  { label: 'Quick order', icon: quickOrder, path: '/orders', isSvg: false },
  { label: 'Table', icon: table, path: '/table', isSvg: false },
  { label: 'Order History', icon: OrderHistoryIcon, path: '/order-history', isSvg: true },
  { label: 'Reservations', icon: reservation, path: '/reservations', isSvg: false },
];

const trainingItems = [
  { label: 'Training', icon: training, path: '/training', isSvg: false },
  { label: 'Team chats', icon: chat, path: '/team-chats', isSvg: false },
  { label: 'Attendance', icon: FiUserCheck, path: '/attendance', isSvg: false },
  { label: 'Sales Performance', icon: saleperfomance, path: '/sales-performance', isSvg: false },
  { label: 'Work Shifts', icon: shift, path: '/work-shifts', isSvg: false },
];

const bottomItems = [
  { label: 'Setting', icon: setting, path: '/settings', isSvg: false },
  { label: 'sign out', icon: logoutIcon, path: '/logout', isSvg: false },
];

interface SidebarProps {
  onLogoutClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogoutClick }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  const renderIcon = (item: any, active: boolean) => {
    if (item.isSvg) {
      return (
        <img
          src={item.icon}
          alt={item.label}
          className={`h-5 w-5 shrink-0 ${active ? 'brightness-0 invert' : 'opacity-70'}`}
        />
      );
    }
    // If icon is a string (PNG asset), render as <img>
    if (typeof item.icon === 'string') {
      return (
        <img
          src={item.icon}
          alt={item.label}
          className={`h-5 w-5 shrink-0 object-contain ${active ? 'brightness-0 invert' : 'opacity-70'}`}
        />
      );
    }
    const IconComponent = item.icon;
    return <IconComponent size={20} className={`shrink-0 ${active ? 'text-white' : 'text-gray-700'}`} />;
  };

  return (
    <aside className="hidden lg:flex flex-col h-screen w-[260px] fixed bg-[#FFF5F9] border-r border-[#0000001A]">
      <div className="px-6 pt-7 pb-6 shrink-0">
        <Link to="/">
          <img src={TriaxxLogo} alt="TRIAXX logo" className="h-8" />
        </Link>
      </div>

      <div className="sidebar-scroll flex-1 overflow-y-auto px-4">
        <nav className="flex flex-col gap-1 mb-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-full font-medium transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-[#9C27B0] to-[#D32F2F] text-white shadow-md'
                  : 'text-gray-700 hover:bg-[#F3E5F5]'
              }`}
            >
              {renderIcon(item, isActive(item.path))}
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
          Training
        </div>
        <nav className="flex flex-col gap-1 mb-6">
          {trainingItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-full font-medium transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-[#9C27B0] to-[#D32F2F] text-white shadow-md'
                  : 'text-gray-700 hover:bg-[#F3E5F5]'
              }`}
            >
              {renderIcon(item, isActive(item.path))}
              <span className="text-sm leading-tight">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="shrink-0 px-4 pb-6 pt-2 flex flex-col gap-1">
        {bottomItems.map((item) => {
          if (item.label === 'sign out') {
            return (
              <button
                key={item.label}
                onClick={onLogoutClick}
                className="flex w-full items-center gap-4 px-4 py-3 rounded-full font-medium text-gray-700 hover:bg-[#F3E5F5] transition-all duration-200"
              >
                <img src={item.icon} alt={item.label} className="h-5 w-5 opacity-70 shrink-0" />
                <span className="text-sm">Sign out</span>
              </button>
            );
          }
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-full font-medium transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-[#9C27B0] to-[#D32F2F] text-white shadow-md'
                  : 'text-gray-700 hover:bg-[#F3E5F5]'
              }`}
            >
              {renderIcon(item, isActive(item.path))}
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;