import React from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

function firstName(fullName = '') {
  return fullName.split(' ')[0] || 'there';
}

export default function StaffDashboard() {
  const { user } = useAuth();
  return (
    <div>
      <PageHeader eyebrow="Staff" title={`Welcome back, ${firstName(user?.fullName)}`} subtitle="Here's what you can do today." />
      <div className="table-card">
        <p className="mb-2 fw-semibold">From the menu above you can:</p>
        <ul className="text-muted mb-0">
          <li>Manage students, courses, grades, attendance, and examinations</li>
          <li>Review and decide on grade appeals</li>
          <li>Check in via QR code and submit your own leave requests</li>
        </ul>
      </div>
    </div>
  );
}
