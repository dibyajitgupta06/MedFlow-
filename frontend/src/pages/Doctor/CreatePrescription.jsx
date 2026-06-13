import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPatientMedicalHistory, createPrescription } from '../../services/api.js';
import { Plus, Trash, FileText, Clipboard, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const CreatePrescription = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const apptId = searchParams.get('apptId');
  const patientId = searchParams.get('patientId');

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form States
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([]);

  // Temp Single Medicine State
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFrequency, setMedFrequency] = useState('');
  const [medDuration, setMedDuration] = useState('');

  // Submit states
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientId) {
        toast.error('Missing patient reference.');
        navigate('/doctor');
        return;
      }
      try {
        const { data } = await getPatientMedicalHistory(patientId);
        setPatient(data.patient);
      } catch (err) {
        toast.error('Failed to load patient profile.');
        navigate('/doctor');
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [patientId]);

  const handleAddMedicine = (e) => {
    e.preventDefault();
    if (!medName.trim() || !medDosage.trim() || !medFrequency.trim() || !medDuration.trim()) {
      toast.error('Please complete all medicine details.');
      return;
    }

    const newMed = {
      name: medName.trim(),
      dosage: medDosage.trim(),
      frequency: medFrequency.trim(),
      duration: medDuration.trim(),
    };

    setMedicines([...medicines, newMed]);
    
    // Clear temp states
    setMedName('');
    setMedDosage('');
    setMedFrequency('');
    setMedDuration('');
    toast.success('Medicine added to prescription list.');
  };

  const handleRemoveMedicine = (idxToRemove) => {
    setMedicines(medicines.filter((_, idx) => idx !== idxToRemove));
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      toast.error('Diagnosis is required.');
      return;
    }
    if (medicines.length === 0) {
      toast.error('Please add at least one medication.');
      return;
    }

    setSubmitting(true);
    try {
      await createPrescription({
        appointmentId: apptId,
        patientId: patientId,
        diagnosis,
        medicines,
        notes,
      });
      toast.success('Prescription released successfully!');
      navigate('/doctor');
    } catch (err) {
      toast.error('Failed to publish prescription.');
    } finally {
      setSubmitting(false);
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Create Digital Prescription</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
          Patient: <span className="text-teal-600 dark:text-teal-400 font-bold">{patient?.name}</span> (Gender: {patient?.gender} · Blood Group: {patient?.bloodGroup})
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800/40 pb-4">
              <Clipboard className="h-5 w-5 text-teal-600" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Rx Details</h3>
            </div>

            <form onSubmit={handleSubmitPrescription} className="space-y-6">
              {/* Diagnosis */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Diagnosis / Clinical Findings</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  placeholder="e.g. Acute Pharyngitis, Essential Hypertension"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>

              {/* Medicines Summary Table */}
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Prescribed Medications</label>
                
                {medicines.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50/50 p-4 rounded-lg text-center dark:bg-slate-900/30">
                    No medicines added yet. Use the widget on the right to add medications.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-400">
                          <th className="py-2">Name</th>
                          <th className="py-2">Dosage</th>
                          <th className="py-2">Frequency</th>
                          <th className="py-2">Duration</th>
                          <th className="py-2 text-right">Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicines.map((med, i) => (
                          <tr key={i} className="border-b border-slate-50 dark:border-slate-800/40 last:border-0">
                            <td className="py-3 font-semibold text-slate-800 dark:text-white">{med.name}</td>
                            <td className="py-3 text-slate-500 dark:text-slate-400">{med.dosage}</td>
                            <td className="py-3 text-slate-500 dark:text-slate-400">{med.frequency}</td>
                            <td className="py-3 text-slate-500 dark:text-slate-400">{med.duration}</td>
                            <td className="py-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveMedicine(i)}
                                className="text-red-500 hover:text-red-700 font-bold p-1 cursor-pointer"
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

              {/* Instructions */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Instructions / General Notes</label>
                <textarea
                  rows="3"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                  placeholder="e.g. Drink plenty of warm fluids. Review in clinic if symptoms worsen."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={() => navigate('/doctor')}
                  className="rounded-xl border border-slate-200 hover:bg-slate-50 px-5 py-2.5 text-sm font-semibold dark:border-slate-800 dark:hover:bg-slate-900 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || medicines.length === 0}
                  className="flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-teal-600 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {submitting ? 'Publishing...' : 'Release Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Medication Editor Form */}
        <div>
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800/40 pb-4 mb-2">
              <Plus className="h-4 w-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Add Medication</h3>
            </div>

            <form onSubmit={handleAddMedicine} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Medicine Name</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                  placeholder="e.g. Paracetamol, Amoxicillin"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Dosage</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                  placeholder="e.g. 500mg, 1 tablet"
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Frequency</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                  placeholder="e.g. Twice daily, Once daily"
                  value={medFrequency}
                  onChange={(e) => setMedFrequency(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Duration</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                  placeholder="e.g. 5 days, 1 week"
                  value={medDuration}
                  onChange={(e) => setMedDuration(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="flex w-full justify-center items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 py-2.5 text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Add to List
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePrescription;
