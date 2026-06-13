import React, { createContext, useState, useEffect, useContext } from 'react';
import { getMe, loginUser, registerPatient } from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user details on startup if token is present
  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await getMe();
          setUser(data);
        } catch (error) {
          console.error('Failed to restore user session:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    bootstrapAuth();
  }, []);

  // Login Handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await loginUser({ email, password });
      localStorage.setItem('token', data.token);
      setUser({
        _id: data._id,
        email: data.email,
        role: data.role,
        profile: data.profile,
      });
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errMsg = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Register Handler (for Patients only)
  const register = async (patientData) => {
    setLoading(true);
    try {
      const { data } = await registerPatient(patientData);
      localStorage.setItem('token', data.token);
      setUser({
        _id: data._id,
        email: data.email,
        role: data.role,
        profile: data.profile,
      });
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      const errMsg = error.response?.data?.message || 'Registration failed.';
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout Handler
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Helper to refresh profile data after editing
  const updateLocalProfile = (newProfile) => {
    setUser((prev) => (prev ? { ...prev, profile: newProfile } : null));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateLocalProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
