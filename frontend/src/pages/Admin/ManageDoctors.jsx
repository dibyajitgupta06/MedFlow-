import React, { useState, useEffect } from 'react';
import { getDoctors, getDepartments, createDoctorAccount, deleteDoctorAccount, updateDoctorAccount } from '../../services/api.js';
import { Plus, Trash, User, Mail, ShieldAlert, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Overlay State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  // Modal Form Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [experience, setExperience] = useState('');
  const [fees, setFees] = useState('');
  const [bio, setBio] = useState('');

  const fetchData = async () => {
    try {
      const [docRes, deptRes] = await Promise.all([getDoctors(), getDepartments()]);
      setDoctors(docRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      toast.error('Failed to load clinic directories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor? This action is permanent.')) return;
    try {
      await deleteDoctorAccount(id);
      toast.success('Doctor deleted successfully.');
      fetchData(); // Refresh
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete doctor.');
    }
  };

  const handleToggleApproval = async (doc) => {
    try {
      await updateDoctorAccount(doc._id, { isApproved: !doc.isApproved });
      toast.success(`Doctor ${doc.isApproved ? 'suspended' : 'approved'} successfully.`);
      fetchData();
    } catch (err) {
      toast.error('Failed to modify doctor approval state.');
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!email || !password || !name || !phone || !specialization || !selectedDept || !experience || !fees) {
      toast.error('Please fill out all required fields.');
      return;
    }

    setAddLoading(true);
    try {
      // Seed default weekly availability
      const defaultAvailability = [
        { day: 'Monday', slots: ['09:00 AM - 09:30 AM', '10:00 AM - 10:30 AM', '11:00 AM - 11:30 AM'] },
        { day: 'Wednesday', slots: ['02:00 PM - 02:30 PM', '03:00 PM - 03:30 PM'] },
        { day: 'Friday', slots: ['09:00 AM - 09:30 AM', '10:00 AM - 10:30 AM'] },
      ];

      await createDoctorAccount({
        email,
        password,
        name,
        phone,
        specialization,
        department: selectedDept,
        experience,
        fees,
        bio,
        availability: defaultAvailability,
      });

      toast.success('Doctor account registered successfully!');
      setShowAddModal(false);
      
      // Clear inputs
      setEmail('');
      setPassword('');
      setName('');
      setPhone('');
      setSpecialization('');
      setSelectedDept('');
      setExperience('');
      setFees('');
      setBio('');

      fetchData(); // Reload list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register doctor.');
    } finally {
      setAddLoading(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manage Medical Team</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Register new doctors, configure departments, and manage credentials.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-teal-600 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Doctor
        </button>
      </div>

      {/* Doctors Grid Table */}
      <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        {doctors.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-12">No doctors found in directory.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3">Name</th>
                  <th className="py-3">Department</th>
                  <th className="py-3">Specialization</th>
                  <th className="py-3">Consultation Fees</th>
                  <th className="py-3">Approval</th>
                  <th className="py-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => (
                  <tr key={doc._id} className="border-b border-slate-50 dark:border-slate-800/40 last:border-0">
                    <td className="py-4">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{doc.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{doc.phone}</p>
                      </div>
                    </td>
                    <td className="py-4 text-slate-500 dark:text-slate-400">{doc.department?.name || 'General'}</td>
                    <td className="py-4">{doc.specialization}</td>
                    <td className="py-4 font-semibold text-slate-850 dark:text-slate-300">৳{doc.fees}</td>
                    <td className="py-4">
                      <button
                        onClick={() => handleToggleApproval(doc)}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer ${
                          doc.isApproved
                            ? 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400'
                            : 'bg-red-100 text-red-750 dark:bg-red-950 dark:text-red-400'
                        }`}
                      >
                        {doc.isApproved ? 'Approved' : 'Suspended'}
                      </button>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="text-red-500 hover:text-red-700 font-bold p-1 cursor-pointer"
                        title="Delete Doctor"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add Doctor Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl dark:bg-slate-950 border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center bg-slate-900 px-6 py-4 text-white">
              <h3 className="text-sm font-bold tracking-wide uppercase">Add Doctor Profile</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddDoctor} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Doctor Name</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                    placeholder="Dr. Arthur Pendragon"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                    placeholder="+1 (555) 999-1111"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                    placeholder="doctor@medflow.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                  <input
                    type="password"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Specialization</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                    placeholder="e.g. Dermatologist"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Department</label>
                  <select
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                  >
                    <option value="">-- Choose Dept --</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Experience (Years)</label>
                  <input
                    type="number"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                    placeholder="e.g. 5"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Consultation Fees (৳)</label>
                  <input
                    type="number"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                    placeholder="e.g. 120"
                    value={fees}
                    onChange={(e) => setFees(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Biography / Profile Summary</label>
                  <textarea
                    rows="2"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                    placeholder="Enter details..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2 text-xs font-semibold dark:border-slate-800 dark:hover:bg-slate-900 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="rounded-xl bg-teal-500 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-600 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {addLoading ? 'Saving...' : 'Add Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDoctors;
