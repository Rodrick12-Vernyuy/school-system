import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import LoginPage from './pages/LoginPage.jsx';
import DashboardRouter from './pages/DashboardRouter.jsx';

import StudentsPage from './pages/academic/StudentsPage.jsx';
import CoursesPage from './pages/academic/CoursesPage.jsx';
import ExamsPage from './pages/academic/ExamsPage.jsx';
import AppealsPage from './pages/academic/AppealsPage.jsx';
import MyCoursesPage from './pages/academic/MyCoursesPage.jsx';

import InvoicesPage from './pages/finance/InvoicesPage.jsx';
import ExpensesPage from './pages/finance/ExpensesPage.jsx';
import ReportsPage from './pages/finance/ReportsPage.jsx';
import CampaignsPage from './pages/finance/CampaignsPage.jsx';
import MyInvoicesPage from './pages/finance/MyInvoicesPage.jsx';

import EmployeesPage from './pages/hr/EmployeesPage.jsx';
import RecruitmentPage from './pages/hr/RecruitmentPage.jsx';
import PayrollPage from './pages/hr/PayrollPage.jsx';
import AttendanceQRPage from './pages/hr/AttendanceQRPage.jsx';
import LeavePage from './pages/hr/LeavePage.jsx';
import AssetsPage from './pages/hr/AssetsPage.jsx';

const STAFF = ['staff', 'admin', 'super_admin'];
const ADMIN = ['admin', 'super_admin'];

function Shell({ children }) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/dashboard" element={<ProtectedRoute><Shell><DashboardRouter /></Shell></ProtectedRoute>} />

      {/* Academic - staff/admin/super_admin */}
      <Route path="/students" element={<ProtectedRoute roles={STAFF}><Shell><StudentsPage /></Shell></ProtectedRoute>} />
      <Route path="/courses" element={<ProtectedRoute roles={STAFF}><Shell><CoursesPage /></Shell></ProtectedRoute>} />
      <Route path="/exams" element={<ProtectedRoute roles={STAFF}><Shell><ExamsPage /></Shell></ProtectedRoute>} />
      <Route path="/appeals" element={<ProtectedRoute roles={[...STAFF, 'student']}><Shell><AppealsPage /></Shell></ProtectedRoute>} />

      {/* Academic - student */}
      <Route path="/my-courses" element={<ProtectedRoute roles={['student']}><Shell><MyCoursesPage /></Shell></ProtectedRoute>} />
      <Route path="/my-invoices" element={<ProtectedRoute roles={['student']}><Shell><MyInvoicesPage /></Shell></ProtectedRoute>} />

      {/* Finance - admin/super_admin (and staff for invoices/reports where relevant) */}
      <Route path="/invoices" element={<ProtectedRoute roles={STAFF}><Shell><InvoicesPage /></Shell></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute roles={ADMIN}><Shell><ExpensesPage /></Shell></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute roles={ADMIN}><Shell><ReportsPage /></Shell></ProtectedRoute>} />
      <Route path="/campaigns" element={<ProtectedRoute roles={ADMIN}><Shell><CampaignsPage /></Shell></ProtectedRoute>} />

      {/* HR - admin/super_admin (staff for QR attendance & leave submission) */}
      <Route path="/employees" element={<ProtectedRoute roles={ADMIN}><Shell><EmployeesPage /></Shell></ProtectedRoute>} />
      <Route path="/recruitment" element={<ProtectedRoute roles={ADMIN}><Shell><RecruitmentPage /></Shell></ProtectedRoute>} />
      <Route path="/payroll" element={<ProtectedRoute roles={ADMIN}><Shell><PayrollPage /></Shell></ProtectedRoute>} />
      <Route path="/attendance-qr" element={<ProtectedRoute roles={STAFF}><Shell><AttendanceQRPage /></Shell></ProtectedRoute>} />
      <Route path="/leave" element={<ProtectedRoute roles={STAFF}><Shell><LeavePage /></Shell></ProtectedRoute>} />
      <Route path="/assets" element={<ProtectedRoute roles={ADMIN}><Shell><AssetsPage /></Shell></ProtectedRoute>} />

      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}
