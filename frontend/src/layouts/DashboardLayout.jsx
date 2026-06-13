import React from 'react';
import Sidebar from '../components/Navigation/Sidebar.jsx';
import Header from '../components/Navigation/Header.jsx';

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Sidebar - Fixed on Left */}
      <Sidebar />

      {/* Main content wrapper */}
      <div className="ml-64 flex flex-col min-h-screen">
        {/* Header - Sticky on Top */}
        <Header />

        {/* Dynamic page container */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
