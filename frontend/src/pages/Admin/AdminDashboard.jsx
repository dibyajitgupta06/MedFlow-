import React, { useState, useEffect } from 'react';
import { getAdminDashboardStats } from '../../services/api.js';
import {
  Users,
  Activity,
  Layers,
  DollarSign,
  Loader
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getAdminDashboardStats();
        setData(data);
      } catch (err) {
        toast.error('Failed to load admin analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const { summary, departmentStats, monthlyStats, doctorWorkload } = data || {
    summary: { totalPatients: 0, totalDoctors: 0, totalDepartments: 0, totalRevenue: 0, statusCounts: {} },
    departmentStats: [],
    monthlyStats: [],
    doctorWorkload: [],
  };

  const COLORS = ['#0d9488', '#06b6d4', '#6366f1', '#a855f7', '#ec4899', '#f43f5e'];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Hospital Management Analytics</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor revenue statistics, patient growth, department distributions, and clinic activity logs.
        </p>
      </div>

      {/* Stats Summary Widgets */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Patients */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover-glow dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between h-32">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Patients</span>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">{summary.totalPatients}</h3>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 dark:bg-slate-800 mt-4 overflow-hidden">
            <div className="bg-teal-500 h-1 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
        </div>

        {/* Total Doctors */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover-glow dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between h-32">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Doctors</span>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">{summary.totalDoctors}</h3>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 dark:bg-slate-800 mt-4 overflow-hidden">
            <div className="bg-indigo-500 h-1 rounded-full" style={{ width: '60%' }}></div>
          </div>
        </div>

        {/* Departments */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover-glow dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between h-32">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-600 dark:bg-pink-950 dark:text-pink-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Specialties</span>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">{summary.totalDepartments}</h3>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 dark:bg-slate-800 mt-4 overflow-hidden">
            <div className="bg-pink-500 h-1 rounded-full" style={{ width: '45%' }}></div>
          </div>
        </div>

        {/* Estimated Revenue */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover-glow dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between h-32">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-650 dark:bg-teal-950 dark:text-teal-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">৳{summary.totalRevenue}</h3>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 dark:bg-slate-800 mt-4 overflow-hidden">
            <div className="bg-teal-650 h-1 rounded-full animate-pulse" style={{ width: '85%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Chart 1: Revenue Trends over months */}
        <div className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/40 dark:bg-slate-950 p-6 shadow-sm glass-panel hover-glow">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-wider">Monthly Revenue Trajectory (৳)</h3>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-900" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Appointments Count per Month */}
        <div className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/40 dark:bg-slate-950 p-6 shadow-sm glass-panel hover-glow">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-wider">Monthly Consultation Volumes</h3>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAppts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-900" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="appointments" fill="url(#colorAppts)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Row (Pie charts & stats tables) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Department Distribution (Pie) */}
        <div className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/40 dark:bg-slate-950 p-6 shadow-sm glass-panel hover-glow flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-850 dark:text-white mb-4 uppercase tracking-wider">Department Specialty Share</h3>
          
          <div className="h-56 w-full flex items-center justify-center text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="appointments"
                >
                  {departmentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center text-[10px] mt-4 font-semibold text-slate-500">
            {departmentStats.map((dept, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                <span>{dept.name} ({dept.appointments})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Workload table */}
        <div className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/40 dark:bg-slate-950 p-6 shadow-sm glass-panel hover-glow lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">Medical Team Workloads</h3>
          
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5">Doctor</th>
                  <th className="py-2.5">Specialization</th>
                  <th className="py-2.5 text-right">Appointments Completed</th>
                </tr>
              </thead>
              <tbody>
                {doctorWorkload.map((doc, i) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-slate-900/20 last:border-0 hover:bg-slate-55/20 dark:hover:bg-slate-900/35 transition-colors">
                    <td className="py-3 font-semibold text-slate-850 dark:text-white">{doc.name}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-450">{doc.specialization}</td>
                    <td className="py-3 text-right font-extrabold text-teal-600 dark:text-teal-400">{doc.appointments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
