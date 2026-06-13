import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // If we are in browser, redirect to login page (avoiding redirection loops)
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const registerPatient = (patientData) => API.post('/auth/register', patientData);
export const getMe = () => API.get('/auth/me');

// Department endpoints
export const getDepartments = () => API.get('/departments');
export const createDepartment = (dept) => API.post('/departments', dept);
export const updateDepartment = (id, dept) => API.put(`/departments/${id}`, dept);
export const deleteDepartment = (id) => API.delete(`/departments/${id}`);

// Doctor endpoints
export const getDoctors = (deptId = '') => API.get(`/doctors${deptId ? `?department=${deptId}` : ''}`);
export const getDoctorProfile = (id) => API.get(`/doctors/${id}`);
export const getDoctorDashboardStats = () => API.get('/doctors/dashboard/stats');
export const getDoctorPatients = () => API.get('/doctors/dashboard/patients');
export const getPatientMedicalHistory = (patientId) => API.get(`/doctors/patients/${patientId}/history`);

// Patient endpoints
export const getPatientProfile = () => API.get('/patients/profile');
export const updatePatientProfile = (profileData) => API.put('/patients/profile', profileData);
export const uploadMedicalReport = (formData) =>
  API.post('/patients/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Appointment endpoints
export const bookAppointment = (apptData) => API.post('/appointments', apptData);
export const getAppointments = () => API.get('/appointments');
export const updateAppointmentStatus = (id, statusData) => API.put(`/appointments/${id}/status`, statusData);

// Prescription endpoints
export const createPrescription = (prescriptionData) => API.post('/prescriptions', prescriptionData);
export const getPrescriptions = () => API.get('/prescriptions');
export const getPrescriptionDetails = (id) => API.get(`/prescriptions/${id}`);
export const getPrescriptionPdfUrl = (id) => `${API.defaults.baseURL}/prescriptions/${id}/pdf`;

// AI Symptom Checker
export const checkSymptoms = (symptomsText) => API.post('/symptoms/check', { symptoms: symptomsText });

// Notifications
export const getNotifications = () => API.get('/notifications');
export const markNotificationRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => API.put('/notifications/read-all');

// Admin endpoints
export const getAdminDashboardStats = () => API.get('/admin/dashboard/stats');
export const createDoctorAccount = (docData) => API.post('/admin/doctors', docData);
export const updateDoctorAccount = (id, docData) => API.put(`/admin/doctors/${id}`, docData);
export const deleteDoctorAccount = (id) => API.delete(`/admin/doctors/${id}`);
export const getPatientsList = () => API.get('/admin/patients');

export default API;
