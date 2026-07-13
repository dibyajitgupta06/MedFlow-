import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import {
  LayoutDashboard,
  User,
  Calendar,
  FileText,
  Brain,
  Users,
  Layers,
  LogOut,
  Activity,
  CalendarDays,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  if (!user) return null;

  const linksByRole = {
    patient: [
      { path: '/patient', label: t('navDashboard'), icon: LayoutDashboard },
      { path: '/patient/book', label: t('navBook'), icon: Calendar },
      { path: '/patient/profile', label: t('navProfile'), icon: User },
    ],
    doctor: [
      { path: '/doctor', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/doctor/patients', label: 'Search Patients', icon: Users },
    ],
    admin: [
      { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/admin/doctors', label: 'Manage Doctors', icon: Users },
      { path: '/admin/patients', label: 'Manage Patients', icon: User },
      { path: '/admin/departments', label: 'Manage Depts', icon: Layers },
      { path: '/admin/appointments', label: 'All Appointments', icon: CalendarDays },
    ],
  };

  const navLinks = linksByRole[user.role] || [];

  return (
    <aside className="fixed bottom-0 left-0 top-0 z-20 flex w-64 flex-col border-r border-slate-200 bg-slate-900 text-slate-350 dark:border-slate-800/60 dark:bg-slate-950">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-800/80 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-550 text-white shadow-md shadow-teal-500/20 animate-pulse">
          <Activity className="h-5 w-5" />
        </div>
        <span className="text-xl font-extrabold tracking-tight text-white bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
          MedFlow
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/patient' || link.path === '/doctor' || link.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 transform ${
                  isActive
                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20 translate-x-1 font-semibold'
                    : 'hover:bg-slate-800/80 hover:text-white hover:translate-x-0.5'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Profile Info & Logout */}
      <div className="border-t border-slate-800/80 p-4 space-y-3">
        <div className="flex items-center gap-3 rounded-xl bg-slate-800/30 p-3 border border-slate-800/40 dark:bg-slate-900/10">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-bold text-teal-400 uppercase">
            {user.profile?.name ? user.profile.name.charAt(0) : user.email.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-white">
              {user.profile?.name || 'MedFlow Admin'}
            </p>
            <p className="truncate text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
              {user.role === 'patient' ? t('patientPortal') : `${user.role} Portal`}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          {t('logout')}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
