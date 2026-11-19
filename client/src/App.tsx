import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CompareFloatingBar } from './components/CompareFloatingBar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/dashboard/DashboardLayout';

// Public Pages
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { FacilityDetailsPage } from './pages/FacilityDetailsPage';
import { CostComparisonPage } from './pages/CostComparisonPage';
import { NearbyMapPage } from './pages/NearbyMapPage';
import { ServicesPage } from './pages/ServicesPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { DisclaimerPage } from './pages/DisclaimerPage';

// Registered User & Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { SavedFacilitiesPage } from './pages/user/SavedFacilitiesPage';
import { MyReportsPage } from './pages/user/MyReportsPage';
import { UserProfilePage } from './pages/user/UserProfilePage';

// Representative Pages
import { RepDashboard } from './pages/rep/RepDashboard';
import { RepFacilityPage } from './pages/rep/RepFacilityPage';
import { RepCostsPage } from './pages/rep/RepCostsPage';
import { RepRevisionsPage } from './pages/rep/RepRevisionsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminFacilitiesPage } from './pages/admin/AdminFacilitiesPage';
import { AdminVerificationPage } from './pages/admin/AdminVerificationPage';
import { AdminCostsPage } from './pages/admin/AdminCostsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

// Public marketing & informational layout (Header + Footer)
const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-ivory-warm text-charcoal-dark selection:bg-forest-deep selection:text-white">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <CompareFloatingBar />
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public Marketing, Informational & Auth Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/disclaimer" element={<DisclaimerPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/categories" element={<Navigate to="/#categories" replace />} />
      </Route>

      {/* 2. Platform Application Routes (Persistent Sidebar & Shared Dashboard Layout) */}
      <Route element={<DashboardLayout />}>
        {/* Healthcare Services, Facilities Search, Compare, Map & Details */}
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/facility/:id" element={<FacilityDetailsPage />} />
        <Route path="/compare" element={<CostComparisonPage />} />
        <Route path="/map" element={<NearbyMapPage />} />

        {/* Role 1: Patient / Healthcare Seeker Routes */}
        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'FACILITY_REPRESENTATIVE']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/dashboard"
          element={<Navigate to="/patient/dashboard" replace />}
        />
        <Route
          path="/user/saved"
          element={
            <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'FACILITY_REPRESENTATIVE']}>
              <SavedFacilitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/reports"
          element={
            <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'FACILITY_REPRESENTATIVE']}>
              <MyReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Role 2: Facility Representative Routes */}
        <Route
          path="/rep/dashboard"
          element={
            <ProtectedRoute allowedRoles={['FACILITY_REPRESENTATIVE', 'ADMIN']}>
              <RepDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rep/facility"
          element={
            <ProtectedRoute allowedRoles={['FACILITY_REPRESENTATIVE', 'ADMIN']}>
              <RepFacilityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rep/costs"
          element={
            <ProtectedRoute allowedRoles={['FACILITY_REPRESENTATIVE', 'ADMIN']}>
              <RepCostsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rep/revisions"
          element={
            <ProtectedRoute allowedRoles={['FACILITY_REPRESENTATIVE', 'ADMIN']}>
              <RepRevisionsPage />
            </ProtectedRoute>
          }
        />

        {/* Role 3: Platform Administrator Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/facilities"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminFacilitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verification"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminVerificationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/costs"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminCostsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminServicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminAuditLogsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
