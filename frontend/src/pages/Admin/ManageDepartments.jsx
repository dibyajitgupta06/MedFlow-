import React, { useState, useEffect } from 'react';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../services/api.js';
import { Plus, Trash, Edit, X, Layers, AlertCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null); // if set, we are editing
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Activity'); // Default Lucide icon mapping
  const [formLoading, setFormLoading] = useState(false);

  const fetchDepts = async () => {
    try {
      const { data } = await getDepartments();
      setDepartments(data);
    } catch (err) {
      toast.error('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleEditClick = (dept) => {
    setEditId(dept._id);
    setName(dept.name);
    setDescription(dept.description);
    setIcon(dept.icon);
    setShowModal(true);
  };

  const handleCreateClick = () => {
    setEditId(null);
    setName('');
    setDescription('');
    setIcon('Activity');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await deleteDepartment(id);
      toast.success('Department deleted successfully.');
      fetchDepts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete department.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !icon) {
      toast.error('Please complete all form fields.');
      return;
    }

    setFormLoading(true);
    try {
      if (editId) {
        await updateDepartment(editId, { name, description, icon });
        toast.success('Department updated successfully.');
      } else {
        await createDepartment({ name, description, icon });
        toast.success('Department created successfully.');
      }
      setShowModal(false);
      fetchDepts(); // Reload
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save department.');
    } finally {
      setFormLoading(false);
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
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Hospital Departments</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure clinical departments, description tags, and service categories.
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-teal-600 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Department
        </button>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => (
          <div
            key={dept._id}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:bg-teal-950 dark:text-teal-400 font-semibold">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(dept)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept._id)}
                    className="text-red-400 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-800 dark:text-white mt-4">{dept.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                {dept.description}
              </p>
            </div>
            
            <div className="border-t border-slate-50 dark:border-slate-800/40 mt-4 pt-3 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Icon Mapping: {dept.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Dialog Form Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl dark:bg-slate-950 border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center bg-slate-900 px-6 py-4 text-white">
              <h3 className="text-sm font-bold tracking-wide uppercase">
                {editId ? 'Edit Department' : 'Create Department'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Department Name</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                  placeholder="e.g. Cardiology"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  rows="3"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                  placeholder="Describe department specialty scope..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Lucide Icon Identifier</label>
                <select
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                >
                  {['Heart', 'Baby', 'Brain', 'Activity', 'Accessibility', 'Sparkles', 'Flame'].map((ic) => (
                    <option key={ic} value={ic}>{ic}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2 text-xs font-semibold dark:border-slate-800 dark:hover:bg-slate-900 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-xl bg-teal-500 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-600 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {formLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDepartments;
