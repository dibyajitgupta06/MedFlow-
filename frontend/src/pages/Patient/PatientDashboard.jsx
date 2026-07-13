import React, { useState, useEffect } from 'react';
import { getAppointments, getPrescriptions, checkSymptoms, updateAppointmentStatus, getPrescriptionPdfUrl } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import {
  Calendar,
  FileText,
  Brain,
  Download,
  AlertTriangle,
  Heart,
  Send,
  Loader,
  Plus,
  Sparkles,
  ChevronRight,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [activeTab, setActiveTab] = useState('symptoms');
  
  // Symptom Checker State
  const [symptomsText, setSymptomsText] = useState('');
  const [symptomLoading, setSymptomLoading] = useState(false);
  const [symptomResult, setSymptomResult] = useState(null);

  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [apptRes, RxRes] = await Promise.all([getAppointments(), getPrescriptions()]);
      setAppointments(apptRes.data);
      setPrescriptions(RxRes.data);
    } catch (err) {
      console.error('Failed to load patient dashboard:', err);
      toast.error('Failed to load portal records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelAppointment = async (apptId) => {
    const confirmMsg = language === 'bn' 
      ? 'আপনি কি নিশ্চিত যে আপনি এই অ্যাপয়েন্টমেন্টটি বাতিল করতে চান?' 
      : 'Are you sure you want to cancel this appointment?';
    if (!window.confirm(confirmMsg)) return;
    try {
      await updateAppointmentStatus(apptId, { status: 'cancelled' });
      toast.success(language === 'bn' ? 'অ্যাপয়েন্টমেন্ট সফলভাবে বাতিল করা হয়েছে।' : 'Appointment cancelled successfully.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || (language === 'bn' ? 'অ্যাপয়েন্টমেন্ট বাতিল করা যায়নি।' : 'Failed to cancel appointment.'));
    }
  };

  const handleSymptomCheck = async (e) => {
    e.preventDefault();
    if (symptomsText.trim().length < 5) {
      toast.error(language === 'bn' ? 'দয়া করে আপনার লক্ষণগুলি আরও বিস্তারিতভাবে বর্ণনা করুন।' : 'Please describe your symptoms in more detail.');
      return;
    }

    setSymptomLoading(true);
    setSymptomResult(null);
    try {
      const { data } = await checkSymptoms(symptomsText);
      setSymptomResult(data);
      toast.success(language === 'bn' ? 'লক্ষণ বিশ্লেষণ সম্পন্ন হয়েছে!' : 'Symptom analysis complete!');
    } catch (err) {
      console.error(err);
      toast.error(language === 'bn' ? 'এআই ডায়াগনোসিস অফলাইন রয়েছে। ক্লিনিকে যোগাযোগ করুন।' : 'AI diagnosis is currently offline. Please seek clinical support.');
    } finally {
      setSymptomLoading(false);
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
    <div className="space-y-8 animate-fade-in">
      {/* Welcome banner */}
      <div className="rounded-3xl bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-600 p-8 text-white shadow-xl shadow-teal-500/10 border border-teal-400/20 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none">
          <Activity className="h-full w-full" />
        </div>
        <span className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
          {t('patientPortal')}
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight mt-4">{t('welcome')}, {user?.profile?.name || 'Guest'}</h1>
        <p className="mt-2 text-teal-50 text-xs font-medium max-w-xl leading-relaxed">
          {language === 'bn' 
            ? 'আপনার হেলথ ড্যাশবোর্ডে স্বাগতম। এখানে এআই লক্ষণ পরীক্ষা, ডাক্তার অ্যাপয়েন্টমেন্ট বুকিং বা ডিজিটাল প্রেসক্রিপশন ডাউনলোড করতে পারেন।' 
            : 'Welcome to your health dashboard. Run AI symptom checks, book appointments, or download medical prescriptions.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex gap-6">
          {[
            { id: 'symptoms', label: t('aiSymptomChecker'), icon: Brain },
            { id: 'appointments', label: t('upcomingConsultations'), icon: Calendar },
            { id: 'prescriptions', label: t('healthHistory'), icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-1 pb-4 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm glass-panel">
        
        {/* TAB 1: AI SYMPTOM CHECKER */}
        {activeTab === 'symptoms' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-teal-500 animate-pulse" />
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">{t('aiSymptomChecker')}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {t('aiDesc')}
                </p>
              </div>
            </div>

            <form onSubmit={handleSymptomCheck} className="space-y-4">
              <div>
                <textarea
                  rows="3"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/30 p-4 text-sm focus:border-teal-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/30"
                  placeholder={t('symptomPlaceholder')}
                  value={symptomsText}
                  onChange={(e) => setSymptomsText(e.target.value)}
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={symptomLoading}
                  className="flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-teal-600 disabled:opacity-50 transition-all hover-scale cursor-pointer"
                >
                  {symptomLoading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      {t('analyzing')}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {t('analyzeBtn')}
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* AI Results Panel */}
            {symptomResult && (
              <div className="mt-8 rounded-2xl border border-teal-500/20 bg-teal-500/[0.01] p-6 space-y-6 dark:bg-teal-950/10 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">{t('analysisResults')}</h4>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">Google Gemini AI Output</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Left Column: Match estimates */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">{t('possibleCondition')}</h5>
                    {symptomResult.conditions?.map((cond, i) => (
                      <div key={i} className="rounded-xl bg-white p-4 border border-slate-100 hover-glow dark:bg-slate-900/60 dark:border-slate-800/80">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-white">{cond.name}</span>
                          <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                            cond.probability === 'High' ? 'bg-red-500/10 text-red-550' :
                            cond.probability === 'Medium' ? 'bg-amber-500/10 text-amber-550' :
                            'bg-green-500/10 text-green-550'
                          }`}>
                            {cond.probability === 'High' ? (language === 'bn' ? 'উচ্চ' : 'High') :
                             cond.probability === 'Medium' ? (language === 'bn' ? 'মাঝারি' : 'Medium') :
                             (language === 'bn' ? 'কম' : 'Low')} {language === 'bn' ? 'সম্ভাবনা' : 'Probability'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-555 dark:text-slate-400 mt-2 leading-relaxed">{cond.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">{t('nextSteps')}</h5>
                    <div className="rounded-xl bg-white p-5 border border-slate-100 hover-glow dark:bg-slate-900/60 dark:border-slate-800/80 space-y-5">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">{language === 'bn' ? 'প্রস্তাবিত বিশেষজ্ঞ বিভাগ' : 'Recommended Specialty'}</span>
                        <p className="text-sm font-extrabold text-teal-600 dark:text-teal-400 mt-1 flex items-center gap-1.5">
                          <ChevronRight className="h-4 w-4" />
                          {symptomResult.specialist}
                        </p>
                      </div>
                      
                      <div className="space-y-2.5 border-t border-slate-50 dark:border-slate-800/60 pt-4">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{language === 'bn' ? 'যত্ন নেওয়ার পদক্ষেপ' : 'Care Action Steps'}</span>
                        <ul className="space-y-2">
                          {symptomResult.nextSteps?.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-650 dark:text-slate-400">
                              <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-850 dark:text-white">{t('upcomingConsultations')}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {language === 'bn' ? 'আপনার নির্ধারিত সময়সূচী পর্যবেক্ষণ করুন অথবা অ্যাপয়েন্টমেন্ট বাতিল করুন।' : 'Monitor your scheduled timeslots or cancel pending requests.'}
                </p>
              </div>
              <button
                onClick={() => navigate('/patient/book')}
                className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-teal-650 transition-all hover-scale cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                {t('bookAppointment')}
              </button>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 dark:text-slate-500 italic">
                {t('noUpcoming')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-850 font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3">{t('doctor')}</th>
                      <th className="py-3">{t('specialization')}</th>
                      <th className="py-3">{t('date')}</th>
                      <th className="py-3">{language === 'bn' ? 'সময়' : 'Time Slot'}</th>
                      <th className="py-3">{t('status')}</th>
                      <th className="py-3 text-right">{t('cancel')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appt) => (
                      <tr key={appt._id} className="border-b border-slate-50 dark:border-slate-900/30 last:border-0 hover:bg-slate-55/50 dark:hover:bg-slate-900/20 transition-colors duration-200">
                        <td className="py-4 font-bold text-slate-850 dark:text-white">{appt.doctor.name}</td>
                        <td className="py-4 text-slate-500 dark:text-slate-400">{appt.department?.name || 'General'}</td>
                        <td className="py-4">{new Date(appt.date).toLocaleDateString()}</td>
                        <td className="py-4 text-slate-500 dark:text-slate-400">{appt.timeSlot}</td>
                        <td className="py-4">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            appt.status === 'approved' ? 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400' :
                            appt.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' :
                            appt.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' :
                            'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          }`}>
                            {appt.status === 'approved' ? (language === 'bn' ? 'অনুমোদিত' : 'Approved') :
                             appt.status === 'completed' ? (language === 'bn' ? 'সম্পন্ন' : 'Completed') :
                             appt.status === 'cancelled' ? (language === 'bn' ? 'বাতিলকৃত' : 'Cancelled') :
                             (language === 'bn' ? 'অপেক্ষমাণ' : 'Pending')}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          {(appt.status === 'pending' || appt.status === 'approved') && (
                            <button
                              onClick={() => handleCancelAppointment(appt._id)}
                              className="rounded-lg border border-red-200 text-red-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide hover:bg-red-50 hover:border-red-300 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/20 transition-all hover-scale cursor-pointer"
                            >
                              {t('cancel')}
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
        )}

        {/* TAB 3: PRESCRIPTIONS */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-850 dark:text-white">{t('healthHistory')}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {language === 'bn' ? 'ওষুধ কেনার জন্য ডিজিটাল প্রেসক্রিপশন ডাউনলোড করুন।' : 'Download digital Rx files for pharmacy purchase.'}
              </p>
            </div>

            {prescriptions.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 dark:text-slate-500 italic">
                {t('noPrescriptions')}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {prescriptions.map((rx) => (
                  <div key={rx._id} className="rounded-2xl border border-slate-100 bg-slate-50/20 p-5 dark:border-slate-800/80 dark:bg-slate-900/20 hover-glow flex flex-col justify-between space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="rounded-full bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 text-[9px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                          {language === 'bn' ? 'প্রেসক্রিপশন নথিভুক্ত' : 'Rx Registered'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-850 dark:text-white mt-2">{rx.doctor.name}</h4>
                        <p className="text-[10px] text-slate-400">{rx.doctor.specialization}</p>
                      </div>
                      <a
                        href={getPrescriptionPdfUrl(rx._id)}
                        download
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500 text-white shadow-md hover:bg-teal-600 transition-all hover-scale"
                        title={language === 'bn' ? 'প্রেসক্রিপশন পিডিএফ ডাউনলোড করুন' : 'Download Prescription PDF'}
                      >
                        <Download className="h-4.5 w-4.5" />
                      </a>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3 flex justify-between text-[11px] text-slate-500">
                      <span>{t('diagnosis')}: <strong className="text-slate-800 dark:text-slate-200 font-bold">{rx.diagnosis}</strong></span>
                      <span>{new Date(rx.date).toLocaleDateString()}</span>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-100 p-4 dark:bg-slate-900 dark:border-slate-800/60 space-y-2 shadow-inner">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">{t('medicines')}</span>
                      <ul className="space-y-1.5 text-xs">
                        {rx.medicines.map((med, i) => (
                          <li key={i} className="flex justify-between border-b border-slate-50 dark:border-slate-850 last:border-0 pb-1.5 last:pb-0">
                            <span className="font-semibold text-slate-750 dark:text-slate-300">{med.name}</span>
                            <span className="text-slate-450 text-[10px]">{med.dosage} · {med.frequency}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default PatientDashboard;
