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
import Lab from '../pages/Lab';
import Inventory from '../pages/Inventory';
import ResearchLayout from '../pages/research/ResearchLayout';
import Portal from '../pages/research/Portal';
import Instruments from '../pages/research/Instruments';
import Analysis from '../pages/research/Analysis';
import Questions from '../pages/research/Questions';
import Demographics from '../pages/research/Demographics';
import Trends from '../pages/research/Trends';
import Impact from '../pages/research/Impact';
import PublicCollection from '../pages/research/PublicCollection';

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
        <Route path="/collect/:id" element={<PublicCollection />} />
        
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
          <Route path="research" element={<ResearchLayout />}>
            <Route index element={<Navigate to="portal" replace />} />
            <Route path="portal" element={<Portal />} />
            <Route path="demographics" element={<Demographics />} />
            <Route path="trends" element={<Trends />} />
            <Route path="instruments" element={<Instruments />} />
            <Route path="analysis" element={<Analysis />} />
            <Route path="questions/:id" element={<Questions />} />
            <Route path="impact" element={<Impact />} />
          </Route>
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
