import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiCalendar, FiUserCheck, FiTrendingUp, FiClock } from 'react-icons/fi';

import TriaxxLogo from '@/assets/tiaxx_logo.svg';
import QuickOrderIcon from '@/assets/navbar/quick_order_icon.svg';
import TableIcon from '@/assets/navbar/table_icon.svg';
import OrderHistoryIcon from '@/assets/navbar/table_icon.svg';
import TrainingIcon from '@/assets/navbar/user2_icon.svg';
import TeamChatsIcon from '@/assets/navbar/headphone_icon.svg';
import SettingIcon from '@/assets/navbar/settings_icon.svg';
import SignOutIcon from '@/assets/navbar/logout_icon.svg';

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
                onClick={onLogoutClick} // 👈 Trigger modal from AppLayout
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