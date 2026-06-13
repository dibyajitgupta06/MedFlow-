import React, { useState, useEffect } from 'react';
import { getAppointments, updateAppointmentStatus } from '../../services/api.js';
import { Calendar, User, Activity, Check, X, Ban, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const { data } = await getAppointments();
      setAppointments(data);
    } catch (err) {
      toast.error('Failed to load appointments registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = async (id, status) => {
    if (!window.confirm(`Are you sure you want to change status to ${status.toUpperCase()}?`)) return;

    try {
      await updateAppointmentStatus(id, { status });
      toast.success(`Appointment successfully ${status}!`);
      fetchAppointments(); // Reload list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Central Appointment Registry</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Audit scheduling statuses, resolve conflicts, and manually update consultation states.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        {appointments.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-12">No appointments scheduled.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3">Patient</th>
                  <th className="py-3">Doctor</th>
                  <th className="py-3">Department</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Slot</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt._id} className="border-b border-slate-50 dark:border-slate-800/40 last:border-0">
                    <td className="py-4">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{appt.patient?.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{appt.patient?.phone}</p>
                      </div>
                    </td>
                    <td className="py-4">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{appt.doctor?.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{appt.doctor?.specialization}</p>
                      </div>
                    </td>
                    <td className="py-4 text-slate-500 dark:text-slate-400">
                      {appt.department?.name || 'General'}
                    </td>
                    <td className="py-4">{new Date(appt.date).toLocaleDateString()}</td>
                    <td className="py-4 text-slate-550 dark:text-slate-400">{appt.timeSlot}</td>
                    <td className="py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        appt.status === 'approved' ? 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400' :
                        appt.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' :
                        appt.status === 'cancelled' ? 'bg-red-100 text-red-750 dark:bg-red-950 dark:text-red-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                      }`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {appt.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(appt._id, 'approved')}
                              className="flex h-7 w-7 items-center justify-center rounded bg-teal-500 hover:bg-teal-600 text-white cursor-pointer"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(appt._id, 'cancelled')}
                              className="flex h-7 w-7 items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        
                        {appt.status === 'approved' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(appt._id, 'completed')}
                              className="flex h-7 w-7 items-center justify-center rounded bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                              title="Mark Completed"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(appt._id, 'cancelled')}
                              className="flex h-7 w-7 items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
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

export default ManageAppointments;
