import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Contracts from './pages/Contracts';
import Contacts from './pages/Contacts';
import Subscription from './pages/Subscription';
import AdminDashboard from './pages/AdminDashboard';
import FavoritesList from './components/User/FavoritesList';
import PipelineManager from './components/User/PipelineManager';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  // If no user, show login page
  if (!user) {
    return <LoginForm />;
  }

  // Check if user needs approval (inactive and no trial days)
  if (user.role !== 'admin' && !user.is_active && user.trial_days_remaining === 0) {
    return (
      <Layout>
        <div className="p-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600\" fill="none\" stroke="currentColor\" viewBox="0 0 24 24">
                  <path strokeLinecap="round\" strokeLinejoin="round\" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Account Pending Approval
              </h1>
              <p className="text-gray-600 mb-6">
                Your account is currently pending admin approval. Please wait for activation or contact support.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  <strong>Support:</strong> support@federaltalks.com
                </p>
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Check Status
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('user');
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // If user is active but has no subscription (and not admin), redirect to subscription
  if (user.role !== 'admin' && user.is_active && user.trial_days_remaining === 0) {
    return (
      <Layout>
        <Routes>
          <Route path="/subscription" element={<Subscription />} />
          <Route path="*" element={<Navigate to="/subscription\" replace />} />
        </Routes>
      </Layout>
    );
  }

  // Normal authenticated flow
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard\" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/opportunities" element={<Contracts />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/favorites" element={<FavoritesList />} />
        <Route path="/pipeline" element={<PipelineManager />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/manage" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<div className="p-6"><h1 className="text-2xl font-bold">User Management</h1><p className="mt-2 text-gray-600">Admin can manage all user accounts, approve subscriptions, and handle trial requests.</p></div>} />
        <Route path="/admin/contracts" element={<Contracts />} />
        <Route path="/admin/opportunities" element={<Contracts />} />
        <Route path="/admin/contacts" element={<Contacts />} />
        <Route path="/admin/subscriptions" element={<div className="p-6"><h1 className="text-2xl font-bold">Subscription Management</h1><p className="mt-2 text-gray-600">Admin can view all subscriptions, approve/deny requests, and manage billing.</p></div>} />
        <Route path="/admin/trials" element={<div className="p-6"><h1 className="text-2xl font-bold">Trial Requests</h1><p className="mt-2 text-gray-600">Review and approve free trial requests from potential users.</p></div>} />
        <Route path="/admin/settings" element={<div className="p-6"><h1 className="text-2xl font-bold">System Settings</h1><p className="mt-2 text-gray-600">Configure system-wide settings and preferences.</p></div>} />
        
        {/* User Routes */}
        <Route path="/map" element={<div className="p-6"><h1 className="text-2xl font-bold">Map View</h1><p className="mt-2 text-gray-600">Interactive map showing contract opportunities by state.</p></div>} />
        <Route path="/search" element={<div className="p-6"><h1 className="text-2xl font-bold">Advanced Search</h1><p className="mt-2 text-gray-600">Powerful search capabilities with AI assistance.</p></div>} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;