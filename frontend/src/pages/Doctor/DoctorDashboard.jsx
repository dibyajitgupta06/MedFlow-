import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctorDashboardStats, updateAppointmentStatus } from '../../services/api.js';
import { Users, Calendar, AlertCircle, FileSpreadsheet, Check, X, Clipboard, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const { data } = await getDoctorDashboardStats();
      setStats(data);
    } catch (err) {
      toast.error('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateStatus = async (apptId, newStatus) => {
    const confirmation = window.confirm(`Are you sure you want to change status to ${newStatus}?`);
    if (!confirmation) return;

    try {
      await updateAppointmentStatus(apptId, { status: newStatus });
      toast.success(`Appointment successfully ${newStatus}!`);
      fetchDashboardData(); // Reload
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const { metrics, recentAppointments } = stats || {
    metrics: { totalAppointments: 0, pendingAppointments: 0, upcomingAppointments: 0, totalPatients: 0 },
    recentAppointments: [],
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Clinical Dashboard</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review patient queue, approve incoming requests, and manage active prescriptions.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Patients */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Patients</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{metrics.totalPatients}</h3>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <AlertCircle className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Requests</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{metrics.pendingAppointments}</h3>
          </div>
        </div>

        {/* Upcoming Consults */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upcoming Consults</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{metrics.upcomingAppointments}</h3>
          </div>
        </div>

        {/* Total Appts */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sessions</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{metrics.totalAppointments}</h3>
          </div>
        </div>

      </div>

      {/* Patients Queue */}
      <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Patient Consultation Queue</h3>

        {recentAppointments.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-12">No patient visits scheduled in the system.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3">Patient</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Slot</th>
                  <th className="py-3">Symptoms</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((appt) => (
                  <tr key={appt._id} className="border-b border-slate-50 dark:border-slate-800/40 last:border-0 text-sm">
                    <td className="py-4">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{appt.patient?.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{appt.patient?.phone}</p>
                      </div>
                    </td>
                    <td className="py-4">{new Date(appt.date).toLocaleDateString()}</td>
                    <td className="py-4 text-slate-500 dark:text-slate-400">{appt.timeSlot}</td>
                    <td className="py-4 max-w-xs truncate text-slate-500 dark:text-slate-400" title={appt.symptoms}>
                      {appt.symptoms || 'None listed'}
                    </td>
                    <td className="py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        appt.status === 'approved' ? 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400' :
                        appt.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' :
                        appt.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                      }`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      {appt.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleUpdateStatus(appt._id, 'approved')}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500 hover:bg-teal-600 text-white cursor-pointer"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(appt._id, 'cancelled')}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                            title="Reject/Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      {appt.status === 'approved' && (
                        <button
                          onClick={() => navigate(`/doctor/prescribe?apptId=${appt._id}&patientId=${appt.patient._id}`)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 text-xs font-bold shadow-sm cursor-pointer"
                        >
                          <Clipboard className="h-3.5 w-3.5" />
                          Prescribe
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
