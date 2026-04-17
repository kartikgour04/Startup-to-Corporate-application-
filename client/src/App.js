import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import StartupsPage from './pages/StartupsPage';
import StartupDetailPage from './pages/StartupDetailPage';
import CorporatesPage from './pages/CorporatesPage';
import CorporateDetailPage from './pages/CorporateDetailPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import OpportunityDetailPage from './pages/OpportunityDetailPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import FundingPage from './pages/FundingPage';
import FundingDetailPage from './pages/FundingDetailPage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import SearchPage from './pages/SearchPage';

import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import ProfileSettings from './pages/dashboard/ProfileSettings';
import StartupProfile from './pages/dashboard/StartupProfile';
import CorporateProfile from './pages/dashboard/CorporateProfile';
import MessagesPage from './pages/dashboard/MessagesPage';
import ConnectionsPage from './pages/dashboard/ConnectionsPage';
import MyOpportunities from './pages/dashboard/MyOpportunities';
import MyPitches from './pages/dashboard/MyPitches';
import MyApplications from './pages/dashboard/MyApplications';
import MyEvents from './pages/dashboard/MyEvents';
import MyFunding from './pages/dashboard/MyFunding';
import NotificationsPage from './pages/dashboard/NotificationsPage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import PitchCreator from './pages/dashboard/PitchCreator';
import PostOpportunity from './pages/dashboard/PostOpportunity';
import AdminDashboard from './pages/admin/AdminDashboard';

const ProtectedRoute = ({ children, roles }) => {
  const { user, initialized } = useAuthStore();
  if (!initialized) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuthStore();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  const { init } = useAuthStore();
  useEffect(() => { init(); }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { borderRadius: '10px', background: '#1e293b', color: '#f1f5f9', fontSize: '14px' } }} />
      <Routes>
        <Route path="/" element={<><Navbar /><LandingPage /><Footer /></>} />
        <Route path="/startups" element={<><Navbar /><StartupsPage /><Footer /></>} />
        <Route path="/startups/:id" element={<><Navbar /><StartupDetailPage /><Footer /></>} />
        <Route path="/corporates" element={<><Navbar /><CorporatesPage /><Footer /></>} />
        <Route path="/corporates/:id" element={<><Navbar /><CorporateDetailPage /><Footer /></>} />
        <Route path="/opportunities" element={<><Navbar /><OpportunitiesPage /><Footer /></>} />
        <Route path="/opportunities/:id" element={<><Navbar /><OpportunityDetailPage /><Footer /></>} />
        <Route path="/events" element={<><Navbar /><EventsPage /><Footer /></>} />
        <Route path="/events/:id" element={<><Navbar /><EventDetailPage /><Footer /></>} />
        <Route path="/funding" element={<><Navbar /><FundingPage /><Footer /></>} />
        <Route path="/funding/:id" element={<><Navbar /><FundingDetailPage /><Footer /></>} />
        <Route path="/pricing" element={<><Navbar /><PricingPage /><Footer /></>} />
        <Route path="/about" element={<><Navbar /><AboutPage /><Footer /></>} />
        <Route path="/search" element={<><Navbar /><SearchPage /><Footer /></>} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="settings" element={<ProfileSettings />} />
          <Route path="startup-profile" element={<StartupProfile />} />
          <Route path="corporate-profile" element={<CorporateProfile />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="connections" element={<ConnectionsPage />} />
          <Route path="opportunities" element={<MyOpportunities />} />
          <Route path="opportunities/new" element={<PostOpportunity />} />
          <Route path="pitches" element={<MyPitches />} />
          <Route path="pitches/new" element={<PitchCreator />} />
          <Route path="applications" element={<MyApplications />} />
          <Route path="events" element={<MyEvents />} />
          <Route path="funding" element={<MyFunding />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
