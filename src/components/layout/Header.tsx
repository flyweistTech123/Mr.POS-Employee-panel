import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import { useStore } from '@/store/zustandStores';
import { useWalkthroughStore } from '@/store/walkthroughStore';
import type { RootState } from '@/redux/store';

import HamburgerIcon from '@/assets/navbar/hamburger_menu.svg';
import SearchIcon from '@/assets/navbar/search_icon.svg';
import DownArrowIcon from '@/assets/header/down_arrow.svg';
import NotificationIcon from '@/assets/header/notification_icon.svg';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface Language {
  code: 'en' | 'fr' | 'hi';
  label: string;
  emoji: string;
}

interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

/* ------------------------------------------------------------------ */
/* Static data                                                        */
/* ------------------------------------------------------------------ */

const LANGUAGES: Language[] = [
  { code: 'en', label: 'English', emoji: '🇺🇸' },
  { code: 'fr', label: 'French', emoji: '🇫🇷' },
  { code: 'hi', label: 'Hindi', emoji: '🇮🇳' },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'New order received',
    body: 'Table 4 placed an order',
    time: '2 min ago',
    read: false,
  },
  {
    id: '2',
    title: 'Shift reminder',
    body: 'Your shift starts at 6:00 PM',
    time: '1 hr ago',
    read: false,
  },
  {
    id: '3',
    title: 'Training module assigned',
    body: 'Food safety level 2',
    time: 'Yesterday',
    read: true,
  },
];

/* ------------------------------------------------------------------ */
/* Hook: close dropdown on outside click / Escape                     */
/* ------------------------------------------------------------------ */

function useClickOutside<T extends HTMLElement>(
  onClose: () => void,
): React.RefObject<T> {
  const ref = useRef<T>(null);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);
  return ref;
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

const Header: React.FC = () => {
  const user = useStore((state) => state.user);
  const authUser = useSelector((s: RootState) => s.auth.user);
  const navigate = useNavigate();

  const displayName =
    authUser?.name || authUser?.Name || user?.name || 'Guest';
  const displayAvatar =
    authUser?.user_image || user?.profilePic || undefined;

  /* ---------------- Language ---------------- */
  const [language, setLanguage] = useState<Language>(LANGUAGES[0]);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useClickOutside<HTMLDivElement>(() => setLangOpen(false));

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setLangOpen(false);
    document.documentElement.lang = lang.code;
    toast.success(`Language: ${lang.label}`, {
      duration: 2000,
      position: 'top-right',
    });
  };

  /* ---------------- Notifications ---------------- */
  const [notifications, setNotifications] =
    useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useClickOutside<HTMLDivElement>(() => setNotifOpen(false));

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const handleNotificationClick = (n: Notification) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)),
    );
    setNotifOpen(false);
    navigate('/notifications');
  };

  /* ---------------- Profile ---------------- */
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useClickOutside<HTMLDivElement>(() =>
    setProfileOpen(false),
  );

  return (
   <header className="fixed top-0 left-[260px] right-0 z-40 hidden lg:flex items-center justify-between px-8 py-4 bg-white border-r border-[#00000033] shadow-[0px_9px_26px_0px_#0000000D]">
      {/* Left side: Search bar */}
      <div className="flex items-center gap-4 px-4 py-2 rounded-full bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] w-full max-w-sm">
        <img src={HamburgerIcon} alt="Menu" className="h-5 w-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search"
          className="bg-transparent focus:outline-none w-full text-gray-800 placeholder-gray-500 font-medium"
        />
        <img src={SearchIcon} alt="Search" className="h-5 w-5 text-gray-500" />
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-4">
        {/* ---------------- Language Dropdown ---------------- */}
        <div className="relative" ref={langRef}>
          <button
            type="button"
            onClick={() => setLangOpen((v) => !v)}
            className="flex items-center gap-3 px-4 py-2 rounded-full bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] cursor-pointer hover:opacity-90"
          >
            <span className="font-medium">{language.label}</span>
            <span className="text-lg leading-none">{language.emoji}</span>
            <img
              src={DownArrowIcon}
              alt=""
              className={`h-3 w-3 transition-transform ${
                langOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 ${
                    lang.code === language.code
                      ? 'bg-gray-50 font-semibold'
                      : ''
                  }`}
                >
                  <span className="text-lg leading-none">{lang.emoji}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ---------------- Notification ---------------- */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative cursor-pointer p-2 hover:opacity-80"
          >
            <img
              src={NotificationIcon}
              alt="Notifications"
              className="h-6 w-6"
            />
            {unreadCount > 0 && (
              <div className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                {unreadCount}
              </div>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-xs text-purple-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 ${
                        n.read ? '' : 'bg-purple-50/40'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {!n.read && (
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {n.body}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1">
                            {n.time}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen(false);
                    navigate('/notifications');
                  }}
                  className="w-full text-center text-sm text-purple-600 font-medium py-3 hover:bg-gray-50"
                >
                  View all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ---------------- Profile ---------------- */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              useWalkthroughStore.getState().next();
              setProfileOpen((v) => !v);
            }}
            className="profile-btn flex items-center gap-3 pl-2 pr-4 py-2 rounded-full bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] cursor-pointer hover:opacity-90"
          >
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt="User Avatar"
                className="h-8 w-8 rounded-full bg-white p-1 object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-purple-700">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-medium">{displayName}</span>
            <img
              src={DownArrowIcon}
              alt=""
              className={`h-3 w-3 transition-transform ${
                profileOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/profile');
                }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50"
              >
                View Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50"
              >
                Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;