import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext.jsx';
import { Activity, ShieldAlert, UserPlus } from 'lucide-react';

const Register = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    const result = await authRegister(data);
    setLoading(false);

    if (result.success) {
      // Register sets the state. Direct to patient portal
      window.location.href = '/patient';
    } else {
      setServerError(result.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 sm:px-6 lg:px-8 dark:bg-slate-950">
      <div className="w-full max-w-lg space-y-8 rounded-2xl bg-slate-800 p-8 shadow-xl border border-slate-700/50">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500 text-white shadow-lg shadow-teal-500/20">
            <Activity className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">Patient Registration</h2>
          <p className="mt-2 text-sm text-slate-400">
            Register your clinical file and get access to your portal
          </p>
        </div>

        {/* Server Errors */}
        {serverError && (
          <div className="flex items-center gap-3 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <p>{serverError}</p>
          </div>
        )}

        {/* Register Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="Karim Uddin"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="karim@gmail.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 4, message: 'Password must be at least 4 characters' },
                })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
              <input
                type="tel"
                {...register('phone', { required: 'Phone number is required' })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="+1 (555) 000-0000"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date of Birth</label>
              <input
                type="date"
                {...register('dob', { required: 'Date of birth is required' })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-sm text-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              {errors.dob && (
                <p className="mt-1 text-xs text-red-400">{errors.dob.message}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
              <select
                {...register('gender', { required: 'Gender selection is required' })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-sm text-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="male" className="bg-slate-800">Male</option>
                <option value="female" className="bg-slate-800">Female</option>
                <option value="other" className="bg-slate-800">Other</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-xs text-red-400">{errors.gender.message}</p>
              )}
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Blood Group</label>
              <select
                {...register('bloodGroup')}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-sm text-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                  <option key={bg} value={bg} className="bg-slate-800">{bg}</option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Home Address</label>
              <textarea
                rows="2"
                {...register('address')}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="123 Main St, Springfield"
              ></textarea>
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
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-semibold text-teal-400 hover:underline hover:text-teal-300"
            >
              Sign in here
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
