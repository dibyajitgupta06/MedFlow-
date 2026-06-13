import React, { useState, useEffect } from 'react';
import { getDoctorPatients, getPatientMedicalHistory } from '../../services/api.js';
import { Search, User, Phone, MapPin, Calendar, Heart, ShieldAlert, FileText, Clipboard, ExternalLink, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Selected Patient Details
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientHistory, setPatientHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await getDoctorPatients();
        setPatients(data);
        if (data.length > 0) {
          setSelectedPatientId(data[0]._id);
        }
      } catch (err) {
        toast.error('Failed to load patient records.');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedPatientId) return;
      setHistoryLoading(true);
      try {
        const { data } = await getPatientMedicalHistory(selectedPatientId);
        setPatientHistory(data);
      } catch (err) {
        toast.error('Failed to load patient history files.');
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [selectedPatientId]);

  // Filter patients by name or phone
  const filteredPatients = patients.filter(
    (pat) =>
      pat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pat.phone.includes(searchQuery)
  );

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
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Patient Clinical Records</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Search registered patients and audit their full medical history, clinical files, and prescriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* LEFT COLUMN: Patients List Search */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm dark:border-slate-800 dark:bg-slate-950 focus:border-teal-500 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950 p-2 max-h-[600px] overflow-y-auto space-y-1">
            {filteredPatients.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-8">No matching records found.</p>
            ) : (
              filteredPatients.map((pat) => (
                <button
                  key={pat._id}
                  onClick={() => setSelectedPatientId(pat._id)}
                  className={`w-full text-left flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all duration-200 cursor-pointer ${
                    selectedPatientId === pat._id
                      ? 'bg-teal-500 text-white font-semibold shadow-sm'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900/60'
                  }`}
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                    selectedPatientId === pat._id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {pat.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{pat.name}</p>
                    <p className={`text-[10px] mt-0.5 ${selectedPatientId === pat._id ? 'text-teal-100' : 'text-slate-400'}`}>
                      {pat.phone}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Selected Patient Medical History */}
        <div className="lg:col-span-2">
          {historyLoading ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950 shadow-sm">
              <Loader className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          ) : !patientHistory ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950 shadow-sm">
              <p className="text-sm text-slate-400">Select a patient to audit their medical files.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Demographics Card */}
              <div className="rounded-2xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-800/40 pb-4">
                  <User className="h-5 w-5 text-teal-600" />
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">Demographics</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs md:grid-cols-4">
                  <div>
                    <span className="text-slate-400">Gender</span>
                    <p className="font-semibold text-slate-800 dark:text-white mt-1 capitalize">{patientHistory.patient.gender}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Date of Birth</span>
                    <p className="font-semibold text-slate-800 dark:text-white mt-1">
                      {new Date(patientHistory.patient.dob).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Blood Group</span>
                    <p className="font-semibold text-teal-600 dark:text-teal-400 mt-1 font-bold">
                      {patientHistory.patient.bloodGroup || 'O+'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone</span>
                    <p className="font-semibold text-slate-800 dark:text-white mt-1">{patientHistory.patient.phone}</p>
                  </div>
                </div>

                {patientHistory.patient.address && (
                  <div className="text-xs border-t border-slate-50 dark:border-slate-800/40 pt-3 flex items-start gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                    <p className="text-slate-600 dark:text-slate-400">{patientHistory.patient.address}</p>
                  </div>
                )}
              </div>

              {/* Allergy Checklist / History */}
              <div className="rounded-2xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-800/40 pb-4">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">Medical History / Allergies</h3>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {patientHistory.patient.medicalHistory?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No allergies or history reported by patient.</p>
                  ) : (
                    patientHistory.patient.medicalHistory?.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600 dark:bg-red-950/20 dark:text-red-400"
                      >
                        {tag}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Consultation Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Past Consultations */}
                <div className="rounded-2xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950 p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-800/40 pb-4">
                    <Calendar className="h-5 w-5 text-teal-600" />
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">Consultations</h3>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto">
                    {patientHistory.appointments?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-8">No appointments logged.</p>
                    ) : (
                      patientHistory.appointments?.map((appt) => (
                        <div key={appt._id} className="text-xs rounded-lg border border-slate-50 p-3 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-900/10 space-y-2">
                          <div className="flex justify-between font-semibold">
                            <span>{appt.doctor?.name}</span>
                            <span className="text-slate-400">{new Date(appt.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400">Symptoms: {appt.symptoms || 'None'}</p>
                          {appt.notes && (
                            <p className="text-slate-600 dark:text-slate-300 bg-white border border-slate-50 p-2 rounded dark:bg-slate-900 dark:border-slate-800">
                              Notes: {appt.notes}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Prescriptions */}
                <div className="rounded-2xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950 p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-800/40 pb-4">
                    <Clipboard className="h-5 w-5 text-teal-600" />
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">Prescriptions</h3>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto">
                    {patientHistory.prescriptions?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-8">No prescriptions released.</p>
                    ) : (
                      patientHistory.prescriptions?.map((rx) => (
                        <div key={rx._id} className="text-xs rounded-lg border border-slate-50 p-3 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-900/10 space-y-2">
                          <div className="flex justify-between font-semibold">
                            <span className="text-teal-600 dark:text-teal-400 font-bold">Dx: {rx.diagnosis}</span>
                            <span className="text-slate-400">{new Date(rx.date).toLocaleDateString()}</span>
                          </div>
                          <ul className="space-y-1 mt-2 text-[11px] list-disc pl-4 text-slate-500 dark:text-slate-400">
                            {rx.medicines?.map((med, i) => (
                              <li key={i}>
                                <strong>{med.name}</strong> - {med.dosage} ({med.frequency} for {med.duration})
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Uploaded Documents List */}
              <div className="rounded-2xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-800/40 pb-4">
                  <FileText className="h-5 w-5 text-teal-600" />
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">Uploaded Records / Reports</h3>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {patientHistory.patient.reports?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic sm:col-span-2 text-center py-6">No reports uploaded by patient.</p>
                  ) : (
                    patientHistory.patient.reports?.map((rep) => (
                      <div key={rep._id} className="flex items-center justify-between rounded-lg border border-slate-50 p-3 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-900/20">
                        <div className="min-w-0 flex-1 text-xs">
                          <p className="truncate font-semibold text-slate-800 dark:text-white">{rep.name}</p>
                          <p className="text-[10px] text-slate-450 mt-0.5">{new Date(rep.uploadedAt).toLocaleDateString()}</p>
                        </div>
                        <a
                          href={`http://localhost:5001${rep.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-3 inline-flex items-center gap-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400 px-2.5 py-1.5 text-[10px] font-bold transition-all"
                        >
                          View File
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DoctorPatients;
