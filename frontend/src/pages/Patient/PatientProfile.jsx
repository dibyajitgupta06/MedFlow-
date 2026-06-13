import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getPatientProfile, updatePatientProfile, uploadMedicalReport } from '../../services/api.js';
import { User, Phone, MapPin, Calendar, Heart, FileText, Upload, Plus, Trash, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const PatientProfile = () => {
  const { updateLocalProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Profile Edit State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('male');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [address, setAddress] = useState('');
  const [historyInput, setHistoryInput] = useState('');
  const [medicalHistory, setMedicalHistory] = useState([]);

  // File Upload State
  const [reportName, setReportName] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchProfile = async () => {
    try {
      const { data } = await getPatientProfile();
      setProfile(data);
      setName(data.name);
      setPhone(data.phone);
      setGender(data.gender);
      setDob(data.dob ? new Date(data.dob).toISOString().substring(0, 10) : '');
      setBloodGroup(data.bloodGroup);
      setAddress(data.address);
      setMedicalHistory(data.medicalHistory || []);
    } catch (err) {
      toast.error('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { data } = await updatePatientProfile({
        name,
        phone,
        gender,
        dob,
        bloodGroup,
        address,
        medicalHistory,
      });
      setProfile(data);
      updateLocalProfile(data); // Sync globally
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  const addHistoryTag = () => {
    if (historyInput.trim() && !medicalHistory.includes(historyInput.trim())) {
      setMedicalHistory([...medicalHistory, historyInput.trim()]);
      setHistoryInput('');
    }
  };

  const removeHistoryTag = (tag) => {
    setMedicalHistory(medicalHistory.filter((t) => t !== tag));
  };

  const handleUploadReport = async (e) => {
    e.preventDefault();
    if (!reportFile) {
      toast.error('Please select a file to upload.');
      return;
    }
    if (!reportName.trim()) {
      toast.error('Please enter a description or name for the report.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('report', reportFile);
    formData.append('name', reportName);

    try {
      const { data } = await uploadMedicalReport(formData);
      setProfile((prev) => ({ ...prev, reports: data.reports }));
      setReportName('');
      setReportFile(null);
      // Reset input element
      document.getElementById('report-file-input').value = '';
      toast.success('Medical report uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
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
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* LEFT COLUMN: Update Profile Form */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-800/40 pb-4 mb-6">
            <User className="h-5 w-5 text-teal-600" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Profile Information</h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                <input
                  type="tel"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date of Birth</label>
                <input
                  type="date"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Blood Group</label>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Home Address</label>
              <textarea
                rows="2"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              ></textarea>
            </div>

            {/* Medical History Tags */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Medical History & Allergies</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  placeholder="e.g. Asthma, Penicillin allergy"
                  value={historyInput}
                  onChange={(e) => setHistoryInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHistoryTag())}
                />
                <button
                  type="button"
                  onClick={addHistoryTag}
                  className="flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 pt-2">
                {medicalHistory.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No historical conditions logged.</span>
                ) : (
                  medicalHistory.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1.5 rounded-lg bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-600 dark:bg-teal-950 dark:text-teal-400"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeHistoryTag(tag)}
                        className="text-teal-600/60 hover:text-teal-600 dark:text-teal-400/60 dark:hover:text-teal-400"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={updating}
                className="rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-teal-600 disabled:opacity-50 transition-all cursor-pointer"
              >
                {updating ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: Medical Reports Upload & List */}
      <div className="space-y-8">
        {/* Upload Form */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-800/40 pb-4 mb-6">
            <Upload className="h-5 w-5 text-teal-600" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Upload Medical Report</h3>
          </div>

          <form onSubmit={handleUploadReport} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Report Description / Name</label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                placeholder="e.g. Annual Blood Work 2026"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select File (PDF or Image)</label>
              <input
                id="report-file-input"
                type="file"
                required
                accept=".pdf,.png,.jpg,.jpeg"
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 dark:file:bg-slate-900 dark:file:text-teal-400 dark:hover:file:bg-slate-800/80"
                onChange={(e) => setReportFile(e.target.files[0])}
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="flex w-full justify-center items-center gap-2 rounded-xl bg-teal-500 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-teal-600 disabled:opacity-50 transition-all cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload File'
              )}
            </button>
          </form>
        </div>

        {/* Uploaded Files List */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-800/40 pb-4 mb-4">
            <FileText className="h-5 w-5 text-teal-600" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Uploaded Records</h3>
          </div>

          <div className="space-y-3">
            {profile?.reports?.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">No files uploaded yet.</p>
            ) : (
              profile?.reports?.map((report) => (
                <div
                  key={report._id}
                  className="flex items-center justify-between rounded-lg border border-slate-50 p-3 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-800 dark:text-white">{report.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(report.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={`http://localhost:5001${report.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-4 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-600 dark:bg-teal-950/20 dark:text-teal-400 px-3 py-1.5 text-xs font-bold transition-all"
                  >
                    View File
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
