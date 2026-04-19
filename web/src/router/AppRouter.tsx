import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Shell from '../components/layout/Shell';
import Login from '../pages/Login';
import Landing from '../pages/Landing';
import Dashboard from '../pages/Dashboard';
import MortalityRecords from '../pages/MortalityRecords';
import RecordDeath from '../pages/RecordDeath';
import HealthAlerts from '../pages/HealthAlerts';
import Research from '../pages/Research';
import Lab from '../pages/Lab';
import Inventory from '../pages/Inventory';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Application Routes */}
        <Route element={
          <ProtectedRoute>
            <Shell />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="deaths" element={<MortalityRecords />} />
          <Route path="deaths/new" element={<RecordDeath />} />
          <Route path="alerts" element={<HealthAlerts />} />
          <Route path="research" element={<Research />} />
          <Route path="lab" element={<Lab />} />
          <Route path="inventory" element={<Inventory />} />
          
          {/* Fallback for other routes */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center py-20">
              <h2 className="text-2xl font-bold text-slate-400">Section Under Construction</h2>
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
