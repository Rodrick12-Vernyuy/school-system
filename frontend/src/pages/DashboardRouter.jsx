import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import SuperAdminDashboard from './dashboards/SuperAdminDashboard.jsx';
import AdminDashboard from './dashboards/AdminDashboard.jsx';
import StaffDashboard from './dashboards/StaffDashboard.jsx';
import StudentDashboard from './dashboards/StudentDashboard.jsx';

export default function DashboardRouter() {
  const { user } = useAuth();
  switch (user?.role) {
    case 'super_admin': return <SuperAdminDashboard />;
    case 'admin': return <AdminDashboard />;
    case 'staff': return <StaffDashboard />;
    case 'student': return <StudentDashboard />;
    default: return <div>Unknown role.</div>;
  }
}
