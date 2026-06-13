import React, { useState, useEffect } from 'react';
import { getPatientsList } from '../../services/api.js';
import { User, Mail, Calendar, Heart, ShieldAlert, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const ManagePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await getPatientsList();
        setPatients(data);
      } catch (err) {
        toast.error('Failed to load patients list.');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const calculateAge = (dobString) => {
    if (!dobString) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Patient Directory</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review registered clinic files, patient profiles, and primary contact parameters.
        </p>
      </div>

      {/* Patients Table */}
      <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        {patients.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-12">No patient accounts registered.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3">Name</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Gender / Age</th>
                  <th className="py-3">Blood Group</th>
                  <th className="py-3">Medical History (Allergies)</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((pat) => (
                  <tr key={pat._id} className="border-b border-slate-50 dark:border-slate-800/40 last:border-0">
                    <td className="py-4">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{pat.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{pat.phone}</p>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5 text-slate-550 dark:text-slate-400">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{pat.user?.email}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-500 dark:text-slate-400 capitalize">
                      {pat.gender} · {calculateAge(pat.dob)} yrs
                    </td>
                    <td className="py-4 font-bold text-teal-600 dark:text-teal-400">{pat.bloodGroup}</td>
                    <td className="py-4 max-w-xs truncate">
                      {pat.medicalHistory?.length === 0 ? (
                        <span className="text-slate-400 italic text-xs">No conditions listed</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {pat.medicalHistory.map((h, i) => (
                            <span
                              key={i}
                              className="rounded bg-red-500/5 px-2 py-0.5 text-[10px] font-semibold text-red-500 border border-red-500/10"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
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

export default ManagePatients;
