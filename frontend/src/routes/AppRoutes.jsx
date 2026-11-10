import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import GaushalaLayout from '../layouts/GaushalaLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

// Public & Auth Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import SignupPublic from '../pages/SignupPublic';
import SignupGaushala from '../pages/SignupGaushala';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import ApplicationStatus from '../pages/ApplicationStatus';

// Public User Features
import ReportCow from '../pages/ReportCow';
import RequestDoctor from '../pages/RequestDoctor';
import SurrenderCow from '../pages/SurrenderCow';
import MyRequests from '../pages/MyRequests';
import TrackRequest from '../pages/TrackRequest';
import GaushalaDirectory from '../pages/GaushalaDirectory';
import Profile from '../pages/Profile';
import NotificationsPage from '../pages/NotificationsPage';

// Gaushala Owner Console
import GaushalaDashboard from '../pages/GaushalaDashboard';
import GaushalaRequests from '../pages/GaushalaRequests';
import RescueManagement from '../pages/RescueManagement';
import DoctorManagement from '../pages/DoctorManagement';
import AppointmentsPage from '../pages/AppointmentsPage';
import CowManagement from '../pages/CowManagement';
import BranchManagement from '../pages/BranchManagement';
import TeamManagement from '../pages/TeamManagement';
import TransportPage from '../pages/TransportPage';
import MedicalRecordsPage from '../pages/MedicalRecordsPage';
import GaushalaReports from '../pages/GaushalaReports';
import GaushalaSettings from '../pages/GaushalaSettings';

// Super Admin Console
import AdminDashboard from '../pages/AdminDashboard';
import AdminApplications from '../pages/AdminApplications';
import AdminGaushalas from '../pages/AdminGaushalas';
import AdminRequests from '../pages/AdminRequests';
import AdminNetworkMap from '../pages/AdminNetworkMap';
import AdminComplaints from '../pages/AdminComplaints';
import AdminAnalytics from '../pages/AdminAnalytics';
import AdminSettings from '../pages/AdminSettings';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages with Top Nav & Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/gaushalas" element={<GaushalaDirectory />} />
        <Route path="/find-gaushala" element={<GaushalaDirectory />} />
        <Route path="/report-cow" element={<ReportCow />} />
        <Route path="/request-doctor" element={<RequestDoctor />} />
        <Route path="/surrender-cow" element={<SurrenderCow />} />
        <Route path="/track-request" element={<TrackRequest />} />

        {/* Protected Public User Routes */}
        <Route
          path="/my-requests"
          element={
            <ProtectedRoute>
              <MyRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Standalone Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup/public" element={<SignupPublic />} />
      <Route path="/signup/gaushala" element={<SignupGaushala />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/application-status" element={<ApplicationStatus />} />

      {/* Gaushala Owner Protected Routes */}
      <Route
        path="/gaushala"
        element={
          <ProtectedRoute allowedRoles={['GAUSHALA_OWNER', 'SUPER_ADMIN']}>
            <GaushalaLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/gaushala/dashboard" replace />} />
        <Route path="dashboard" element={<GaushalaDashboard />} />
        <Route path="requests" element={<GaushalaRequests />} />
        <Route path="rescue" element={<RescueManagement />} />
        <Route path="doctors" element={<DoctorManagement />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="cows" element={<CowManagement />} />
        <Route path="branches" element={<BranchManagement />} />
        <Route path="team" element={<TeamManagement />} />
        <Route path="transport" element={<TransportPage />} />
        <Route path="medical-records" element={<MedicalRecordsPage />} />
        <Route path="reports" element={<GaushalaReports />} />
        <Route path="settings" element={<GaushalaSettings />} />
      </Route>

      {/* Super Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="gaushalas" element={<AdminGaushalas />} />
        <Route path="requests" element={<AdminRequests />} />
        <Route path="map" element={<AdminNetworkMap />} />
        <Route path="complaints" element={<AdminComplaints />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Fallback to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

