import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/api.js';
import { Bell, Sun, Moon, Check, CheckSquare } from 'lucide-react';

const Header = () => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const dropdownRef = useRef(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const fetchNotifs = async () => {
    if (!user) return;
    try {
      const { data } = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 45000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all read:', error);
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200/50 bg-white/70 px-8 backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-950/70">
      <div className="flex items-center">
        <h2 className="text-sm font-bold tracking-tight text-slate-800 dark:text-white">
          {t('welcome')}, <span className="text-teal-650 dark:text-teal-400 bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">{user?.profile?.name || 'Administrator'}</span>
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Language Toggle for Patients */}
        {user?.role === 'patient' && (
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="flex h-9 px-3 items-center justify-center rounded-xl border border-slate-200/60 bg-white text-xs font-bold text-teal-650 hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-900 dark:text-teal-400 dark:hover:bg-slate-800 hover-scale transition-all duration-300 shadow-sm cursor-pointer gap-1.5"
            title={language === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
          >
            <span className="text-sm">🌐</span>
            <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/60 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white hover-scale transition-all duration-300 shadow-sm cursor-pointer"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-400 animate-spin-slow" /> : <Moon className="h-4.5 w-4.5 text-teal-600" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/60 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white hover-scale transition-all duration-300 shadow-sm cursor-pointer"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-teal-500 text-[9px] font-extrabold text-white ring-2 ring-white dark:ring-slate-950 pulse-glow">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[10px] font-bold text-teal-600 hover:underline dark:text-teal-400"
                  >
                    <CheckSquare className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`flex items-start gap-3 border-b border-slate-50 px-4 py-3 dark:border-slate-850 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 ${
                        !notif.isRead ? 'bg-teal-500/[0.03]' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-white">{notif.title}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{notif.message}</p>
                        <p className="text-[8px] text-slate-400 mt-1">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notif._id)}
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-teal-105 hover:text-teal-600 dark:bg-slate-800 dark:hover:bg-teal-950 dark:hover:text-teal-400 transition-all cursor-pointer"
                          title="Mark as read"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
