import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext.jsx';
import { Activity, ShieldAlert, LogIn } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Redirect target
  const from = location.state?.from?.pathname || '';

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    const result = await login(data.email, data.password);
    setLoading(false);

    if (result.success) {
      // Decode user role to redirect
      const userStr = localStorage.getItem('token');
      // If success, user is updated in AuthContext. Force redirect based on role:
      const savedUser = JSON.parse(localStorage.getItem('user')) || {};
      
      // Fetch token info/role via checking direct auth result
      // Wait, we can redirect based on login response or read from auth status
      // Let's redirect dynamically:
      setTimeout(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          // We can parse payload role
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          // Wait, let's fetch getMe profile role
          // Since getMe was called or we set it in login:
          // Let's check which dashboard they go to
          // We will check by reloading or navigate directly:
          // Let's verify context user
          // Actually, we can fetch role directly since we set user state in AuthContext:
          window.location.href = from || (
            payload.role === 'admin' ? '/admin' :
            payload.role === 'doctor' ? '/doctor' : '/patient'
          );
        }
      }, 100);
    } else {
      setServerError(result.error);
    }
  };

  // Quick login helper for developers
  const triggerQuickLogin = (email, password) => {
    setValue('email', email);
    setValue('password', password);
    handleSubmit(onSubmit)();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 sm:px-6 lg:px-8 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-slate-800 p-8 shadow-xl border border-slate-700/50">
        
        {/* Branding header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500 text-white shadow-lg shadow-teal-500/20">
            <Activity className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">MedFlow Portals</h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to access your healthcare dashboard
          </p>
        </div>

        {/* Server Errors */}
        {serverError && (
          <div className="flex items-center gap-3 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <p>{serverError}</p>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="doctor@medflow.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center items-center gap-2 rounded-lg bg-teal-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 hover:bg-teal-600 hover:shadow-teal-500/30 active:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </button>
          </div>
        </form>

        {/* Demo Fast Login Cards */}
        <div className="relative mt-8">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-800 px-2 text-slate-400 font-medium">Demo Quick Logins</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <button
            onClick={() => triggerQuickLogin('admin@medflow.com', 'admin123')}
            className="flex flex-col items-center justify-center rounded-lg border border-slate-700 bg-slate-700/30 py-2 hover:bg-slate-700/60 text-[10px] font-bold text-teal-400 hover:text-teal-300 transition-all cursor-pointer"
          >
            <span>Admin</span>
            <span className="text-[8px] text-slate-500 font-normal">Full control</span>
          </button>
          <button
            onClick={() => triggerQuickLogin('alice.smith@medflow.com', 'doctor123')}
            className="flex flex-col items-center justify-center rounded-lg border border-slate-700 bg-slate-700/30 py-2 hover:bg-slate-700/60 text-[10px] font-bold text-teal-400 hover:text-teal-300 transition-all cursor-pointer"
          >
            <span>Doctor</span>
            <span className="text-[8px] text-slate-500 font-normal">Alice Smith</span>
          </button>
          <button
            onClick={() => triggerQuickLogin('john.doe@gmail.com', 'patient123')}
            className="flex flex-col items-center justify-center rounded-lg border border-slate-700 bg-slate-700/30 py-2 hover:bg-slate-700/60 text-[10px] font-bold text-teal-400 hover:text-teal-300 transition-all cursor-pointer"
          >
            <span>Patient</span>
            <span className="text-[8px] text-slate-500 font-normal">John Doe</span>
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-slate-400">
            New patient?{' '}
            <button
              onClick={() => navigate('/register')}
              className="font-semibold text-teal-400 hover:underline hover:text-teal-300"
            >
              Create patient profile
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
