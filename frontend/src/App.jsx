import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';

// Auth Pages
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';

// Patient Pages
import PatientDashboard from './pages/Patient/PatientDashboard.jsx';
import PatientProfile from './pages/Patient/PatientProfile.jsx';
import BookAppointment from './pages/Patient/BookAppointment.jsx';

// Doctor Pages
import DoctorDashboard from './pages/Doctor/DoctorDashboard.jsx';
import DoctorPatients from './pages/Doctor/DoctorPatients.jsx';
import CreatePrescription from './pages/Doctor/CreatePrescription.jsx';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import ManageDoctors from './pages/Admin/ManageDoctors.jsx';
import ManagePatients from './pages/Admin/ManagePatients.jsx';
import ManageDepartments from './pages/Admin/ManageDepartments.jsx';
import ManageAppointments from './pages/Admin/ManageAppointments.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0f172a',
              color: '#ffffff',
              borderRadius: '12px',
              fontSize: '13px',
            },
            success: {
              iconTheme: {
                primary: '#0d9488',
                secondary: '#ffffff',
              },
            },
          }}
        />
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Patient Routes */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <DashboardLayout>
                  <PatientDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <DashboardLayout>
                  <PatientProfile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/book"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <DashboardLayout>
                  <BookAppointment />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Doctor Routes */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DashboardLayout>
                  <DoctorDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DashboardLayout>
                  <DoctorPatients />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/prescribe"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DashboardLayout>
                  <CreatePrescription />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctors"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <ManageDoctors />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/patients"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <ManagePatients />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <ManageDepartments />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <ManageAppointments />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Default Redirection */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
