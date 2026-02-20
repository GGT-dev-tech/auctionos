import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { AuctionList } from './pages/AuctionList';
import { AuctionService } from './services/api';
import PropertyManualEntry from './pages/PropertyManualEntry';
import PropertyDetails from './pages/PropertyDetails';

import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import AdminAuctions from './pages/admin/AdminAuctions';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ... existing protected route logic
  const user = AuctionService.getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="/auctions" element={<AuctionList />} />
            <Route path="/admin/auctions" element={<AdminAuctions />} />
            <Route path="settings" element={<Settings />} />
            <Route path="properties/new" element={<PropertyManualEntry />} />
            <Route path="properties/:id" element={<PropertyDetails />} />
            {/* <Route path="properties/:id/edit" element={<PropertyWizard />} /> */}
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<div className="p-8 text-center text-slate-500">Page under construction</div>} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;