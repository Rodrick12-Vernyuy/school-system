import React, { useEffect, useState } from 'react';
import { FiUsers, FiBriefcase, FiDollarSign, FiUserCheck } from 'react-icons/fi';
import DashboardCard from '../../components/DashboardCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { academicApi } from '../../api/academic.js';
import { hrApi } from '../../api/hr.js';
import { financeApi } from '../../api/finance.js';
import { useAuth } from '../../context/AuthContext.jsx';

function firstName(fullName = '') {
  return fullName.split(' ')[0] || 'there';
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [state, setState] = useState({ students: 0, hr: null, outstanding: 0, loading: true });

  useEffect(() => {
    (async () => {
      try {
        const [students, hrSummary, outstanding] = await Promise.all([
          academicApi.listStudents({ limit: 1 }),
          hrApi.dashboardSummary(),
          financeApi.outstandingFees(),
        ]);
        setState({ students: students.total, hr: hrSummary, outstanding: outstanding.totalOutstanding, loading: false });
      } catch {
        setState((s) => ({ ...s, loading: false }));
      }
    })();
  }, []);

  if (state.loading) return <div>Loading dashboard…</div>;

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title={`Welcome back, ${firstName(user?.fullName)}`}
        subtitle="Manage students, employees, fees, and attendance from one place."
      />

      <div className="row">
        <DashboardCard index={0} icon={FiUsers} label="Students" value={state.students} />
        <DashboardCard index={1} icon={FiBriefcase} label="Employees" value={state.hr?.totalEmployees ?? '—'} />
        <DashboardCard index={2} icon={FiDollarSign} label="Outstanding Fees" value={`${(state.outstanding ?? 0).toLocaleString()} FCFA`} />
        <DashboardCard index={3} icon={FiUserCheck} label="Present Today" value={state.hr?.employeesPresentToday ?? '—'} />
      </div>

      <div className="table-card">
        <p className="text-muted mb-0">
          Use the menu above to manage students, courses, invoices, expenses, employees, and leave requests.
        </p>
      </div>
    </div>
  );
}
