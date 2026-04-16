import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import AuthSuccess from './pages/AuthSuccess';
import Dashboard from './pages/Dashboard';
import Watchlist from './pages/Watchlist';
import Conditions from './pages/Conditions';
import CreateCondition from './pages/CreateCondition';
import Alerts from './pages/Alerts';

const AppContent = () => {
  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/success" element={<AuthSuccess />} />

        {/* Protected — all wrapped with Navbar */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navbar />
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/watchlist"
          element={
            <ProtectedRoute>
              <Navbar />
              <Watchlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conditions"
          element={
            <ProtectedRoute>
              <Navbar />
              <Conditions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conditions/create"
          element={
            <ProtectedRoute>
              <Navbar />
              <CreateCondition />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Navbar />
              <Alerts />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-navy-900 font-sans">
          <AnimatePresence mode="wait">
            <AppContent />
          </AnimatePresence>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
