import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { Landing } from './pages/Landing';
import { Signup } from './pages/Signup';
import { AuctionList } from './pages/AuctionList';
import { AuthService } from './services/auth.service';
import PropertyManualEntry from './pages/PropertyManualEntry';
import PropertyDetails from './pages/PropertyDetails';

import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import AdminAuctions from './pages/admin/AdminAuctions';
import PropertyDetailPage from './pages/admin/PropertyDetailPage';
import AdminLists from './pages/admin/AdminLists';
import AdminResearch from './pages/admin/AdminResearch';

// Client Portal Pages
import ClientLayout from './layouts/ClientLayout';
import ClientDashboard from './pages/client/ClientDashboard';
import ClientAuctions from './pages/client/ClientAuctions';
import ClientProperties from './pages/client/ClientProperties';
import ClientLists from './pages/client/ClientLists';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ... existing protected route logic
  const user = AuthService.getCurrentUser();
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
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes (Admin/Agent) */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/auctions" element={<AuctionList filters={{}} />} />
            <Route path="/admin/auctions" element={<AdminAuctions />} />
            <Route path="/admin/properties/:id" element={<PropertyDetailPage />} />
            <Route path="/admin/lists" element={<AdminLists />} />
            <Route path="/admin/research" element={<AdminResearch />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/properties/new" element={<PropertyManualEntry />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Client Portal Routes */}
          <Route path="/client" element={<ProtectedRoute><ClientLayout /></ProtectedRoute>}>
            <Route index element={<ClientDashboard />} />
            <Route path="auctions" element={<ClientAuctions />} />
            <Route path="properties" element={<ClientProperties />} />
            <Route path="lists" element={<ClientLists />} />
            {/* Target same detail page internally handling client view restrictions */}
            <Route path="properties/:id" element={<PropertyDetailPage readOnly={true} />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;