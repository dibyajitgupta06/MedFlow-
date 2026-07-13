import React, { createContext, useState, useEffect, useContext } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // General
    welcome: 'Welcome',
    logout: 'Logout',
    dashboard: 'Dashboard',
    bookAppointment: 'Book Appointment',
    profile: 'Profile',
    taka: '৳',
    currency: 'BDT',
    success: 'Success!',
    cancel: 'Cancel',
    actions: 'Actions',
    status: 'Status',
    date: 'Date',
    loading: 'Loading...',

    // Sidebar
    navDashboard: 'Dashboard',
    navBook: 'Book Appointment',
    navProfile: 'Profile',
    navLogout: 'Logout',
    brandSubtitle: 'Care Flow',

    // Dashboard
    patientPortal: 'Patient Portal',
    quickActions: 'Quick Telehealth Actions',
    aiSymptomChecker: 'AI Symptom Checker',
    aiDesc: 'Describe your symptoms to receive instant medical advice and matching conditions powered by Gemini AI.',
    symptomPlaceholder: 'Type your symptoms here (e.g. fever, headache, dry cough)...',
    analyzeBtn: 'Analyze Symptoms',
    analyzing: 'Analyzing...',
    analysisResults: 'Symptoms Analysis Results',
    possibleCondition: 'Possible Condition',
    matchProbability: 'Match Probability',
    severity: 'Severity',
    nextSteps: 'Next Steps',
    aiDisclaimer: 'Note: This is an AI-powered guidance and not a final medical diagnosis.',
    
    upcomingConsultations: 'Upcoming Consultations',
    noUpcoming: 'No upcoming consultations found.',
    doctor: 'Doctor',
    specialization: 'Specialization',
    dateTime: 'Date & Time',
    viewPrescription: 'View Prescription',
    cancelAppointment: 'Cancel',

    healthHistory: 'Prescriptions & Health History',
    noPrescriptions: 'No prescriptions found yet.',
    diagnosis: 'Diagnosis',
    medicines: 'Medicines',
    downloadPdf: 'Download PDF',
    dosage: 'Dosage',
    frequency: 'Frequency',
    duration: 'Duration',
    notes: 'Clinical Notes',

    // Book Appointment
    scheduleConsultation: 'Schedule a New Consultation',
    bookSubtitle: 'Fill in the details below to book an appointment with our specialist doctors.',
    selectDept: 'Select Department',
    chooseDeptOpt: '-- Choose Department --',
    chooseDocOpt: '-- Choose Doctor --',
    apptDate: 'Appointment Date',
    availableSlots: 'Available Slots',
    selectDateFirst: '-- Select Date First --',
    noSlots: 'No Slots Available (Doctor Offline/Fully Booked)',
    chooseSlotOpt: '-- Choose Slot --',
    describeSymptoms: 'Describe Symptoms',
    reasonVisit: 'Reason for Visit',
    symptomsPlaceholder: 'e.g. Mild headache, sore throat for 3 days',
    reasonPlaceholder: 'e.g. Routine follow-up, physical exam',
    consultationFees: 'Consultation Fees',
    clinicLocation: 'Location',
    paymentNotice: 'Payments are handled during clinical check-in.',
    confirmApptBtn: 'Confirm Appointment',
    apptSuccess: 'Appointment booked successfully!',

    // Profile
    personalHealthCard: 'Personal Health Card',
    profileSubtitle: 'Update your medical history, personal details, and contact info.',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    gender: 'Gender',
    genderMale: 'Male',
    genderFemale: 'Female',
    genderOther: 'Other',
    dob: 'Date of Birth',
    bloodGroup: 'Blood Group',
    address: 'Home Address',
    medicalHistoryTitle: 'Medical History & Conditions',
    addConditionPlaceholder: 'e.g. Asthma, Diabetes',
    addBtn: 'Add',
    updateProfileBtn: 'Update Profile',
    profileSuccess: 'Profile updated successfully!',
  },
  bn: {
    // General
    welcome: 'স্বাগতম',
    logout: 'লগআউট',
    dashboard: 'ড্যাশবোর্ড',
    bookAppointment: 'অ্যাপয়েন্টমেন্ট বুকিং',
    profile: 'প্রোফাইল',
    taka: '৳',
    currency: 'টাকা',
    success: 'সফল হয়েছে!',
    cancel: 'বাতিল',
    actions: 'কাজ',
    status: 'অবস্থা',
    date: 'তারিখ',
    loading: 'লোড হচ্ছে...',

    // Sidebar
    navDashboard: 'ড্যাশবোর্ড',
    navBook: 'অ্যাপয়েন্টমেন্ট বুক করুন',
    navProfile: 'ব্যক্তিগত প্রোফাইল',
    navLogout: 'লগআউট',
    brandSubtitle: 'কেয়ার ফ্লো',

    // Dashboard
    patientPortal: 'রোগী পোর্টাল',
    quickActions: 'দ্রুত চিকিৎসা সেবা',
    aiSymptomChecker: 'এআই লক্ষণ পরীক্ষক',
    aiDesc: 'তাত্ক্ষণিক চিকিৎসা পরামর্শের জন্য আপনার শারীরিক লক্ষণগুলি এখানে লিখুন (Gemini AI দ্বারা চালিত)।',
    symptomPlaceholder: 'এখানে আপনার লক্ষণগুলি লিখুন (যেমন: জ্বর, মাথাব্যথা, শুকনো কাশি)...',
    analyzeBtn: 'লক্ষণ বিশ্লেষণ করুন',
    analyzing: 'বিশ্লেষণ করা হচ্ছে...',
    analysisResults: 'লক্ষণ বিশ্লেষণ ফলাফল',
    possibleCondition: 'সম্ভাব্য রোগ',
    matchProbability: 'মেলার সম্ভাবনা',
    severity: 'তীব্রতা',
    nextSteps: 'পরবর্তী পদক্ষেপ',
    aiDisclaimer: 'দ্রষ্টব্য: এটি কৃত্রিম বুদ্ধিমত্তা দ্বারা চালিত প্রাথমিক পরামর্শ, কোনো চূড়ান্ত চিকিৎসা নির্ণয় নয়।',
    
    upcomingConsultations: 'আসন্ন অ্যাপয়েন্টমেন্টসমূহ',
    noUpcoming: 'কোনো আসন্ন অ্যাপয়েন্টমেন্ট পাওয়া যায়নি।',
    doctor: 'ডাক্তার',
    specialization: 'বিশেষত্ব',
    dateTime: 'তারিখ ও সময়',
    viewPrescription: 'প্রেসক্রিপশন দেখুন',
    cancelAppointment: 'বাতিল করুন',

    healthHistory: 'প্রেসক্রিপশন ও স্বাস্থ্য ইতিহাস',
    noPrescriptions: 'কোনো প্রেসক্রিপশন পাওয়া যায়নি।',
    diagnosis: 'রোগ নির্ণয়',
    medicines: 'ওষুধসমূহ',
    downloadPdf: 'পিডিএফ ডাউনলোড',
    dosage: 'মাত্রা',
    frequency: 'ব্যবহারের নিয়ম',
    duration: 'সময়কাল',
    notes: 'ডাক্তারের পরামর্শ',

    // Book Appointment
    scheduleConsultation: 'নতুন অ্যাপয়েন্টমেন্ট বুক করুন',
    bookSubtitle: 'আমাদের বিশেষজ্ঞ ডাক্তারদের সাথে অ্যাপয়েন্টমেন্ট নিতে নিচের তথ্যগুলো পূরণ করুন।',
    selectDept: 'বিভাগ নির্বাচন করুন',
    chooseDeptOpt: '-- বিভাগ বেছে নিন --',
    chooseDocOpt: '-- ডাক্তার বেছে নিন --',
    apptDate: 'অ্যাপয়েন্টমেন্টের তারিখ',
    availableSlots: 'উপলব্ধ সময়',
    selectDateFirst: '-- প্রথমে তারিখ নির্বাচন করুন --',
    noSlots: 'কোনো সময় খালি নেই (ডাক্তার অফলাইন বা বুকড)',
    chooseSlotOpt: '-- সময় বেছে নিন --',
    describeSymptoms: 'লক্ষণসমূহ বর্ণনা করুন',
    reasonVisit: 'পরিদর্শনের কারণ',
    symptomsPlaceholder: 'যেমন: ৩ দিন ধরে হালকা জ্বর এবং গলা ব্যথা',
    reasonPlaceholder: 'যেমন: নিয়মিত ফলো-আপ বা শারীরিক পরীক্ষা',
    consultationFees: 'কনসালটেশন ফি (ভিজিট)',
    clinicLocation: 'স্থান',
    paymentNotice: 'ক্লিনিকে আসার পর কাউন্টারে ফি পরিশোধ করতে হবে।',
    confirmApptBtn: 'অ্যাপয়েন্টমেন্ট নিশ্চিত করুন',
    apptSuccess: 'অ্যাপয়েন্টমেন্ট সফলভাবে বুক করা হয়েছে!',

    // Profile
    personalHealthCard: 'ব্যক্তিগত স্বাস্থ্য কার্ড',
    profileSubtitle: 'আপনার রোগের ইতিহাস, ব্যক্তিগত বিবরণ এবং যোগাযোগের তথ্য পরিবর্তন বা যোগ করুন।',
    fullName: 'পূর্ণ নাম',
    phoneNumber: 'ফোন নম্বর',
    gender: 'লিঙ্গ',
    genderMale: 'পুরুষ',
    genderFemale: 'নারী',
    genderOther: 'অন্যান্য',
    dob: 'জন্ম তারিখ',
    bloodGroup: 'রক্তের গ্রুপ',
    address: 'স্থায়ী ঠিকানা',
    medicalHistoryTitle: 'পূর্ববর্তী রোগের ইতিহাস',
    addConditionPlaceholder: 'যেমন: অ্যাজমা, ডায়াবেটিস',
    addBtn: 'যুক্ত করুন',
    updateProfileBtn: 'প্রোফাইল আপডেট করুন',
    profileSuccess: 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে!',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('language') || 'bn'; // Default to Bangla for Bangladesh scenario
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key) => {
    if (!translations[language] || !translations[language][key]) {
      return translations['en'][key] || key; // Fallback to English
    }
    return translations[language][key];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
export default LanguageContext;
