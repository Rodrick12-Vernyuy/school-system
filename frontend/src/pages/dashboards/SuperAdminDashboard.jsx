import React, { useEffect, useState } from 'react';
import { FiUsers, FiBriefcase, FiDollarSign, FiClock } from 'react-icons/fi';
import DashboardCard from '../../components/DashboardCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import RowAvatar from '../../components/RowAvatar.jsx';
import Pill from '../../components/Pill.jsx';
import BarChart from '../../components/BarChart.jsx';
import { academicApi } from '../../api/academic.js';
import { hrApi, gatewayApi } from '../../api/hr.js';
import { financeApi } from '../../api/finance.js';
import { useAuth } from '../../context/AuthContext.jsx';

function firstName(fullName = '') {
  return fullName.split(' ')[0] || 'there';
}

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [state, setState] = useState({
    students: [], studentsTotal: 0, employees: [], hr: null, outstanding: 0, health: null, loading: true, error: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const [students, employees, hrSummary, outstanding, health] = await Promise.all([
          academicApi.listStudents({ limit: 6 }),
          hrApi.listEmployees(),
          hrApi.dashboardSummary(),
          financeApi.outstandingFees(),
          gatewayApi.serviceHealth(),
        ]);
        setState({
          students: students.data,
          studentsTotal: students.total,
          employees: employees.data,
          hr: hrSummary,
          outstanding: outstanding.totalOutstanding,
          health,
          loading: false,
          error: '',
        });
      } catch (err) {
        setState((s) => ({ ...s, loading: false, error: 'Could not load one or more dashboard widgets. Is the backend running?' }));
      }
    })();
  }, []);

  if (state.loading) return <div>Loading dashboard…</div>;

  // Real, derived chart data (no fabricated numbers): employee headcount
  // grouped by department, from the HR Service's own employee list.
  const byDepartment = {};
  for (const e of state.employees) byDepartment[e.department] = (byDepartment[e.department] || 0) + 1;
  const chartData = Object.entries(byDepartment).slice(0, 6).map(([label, value]) => ({ label, value }));

  return (
    <div>
      <PageHeader
        eyebrow="Super Admin"
        title={`Welcome back, ${firstName(user?.fullName)}`}
        subtitle="Here's what's happening across Academic, Finance, and HR today."
      />
      {state.error && <div className="alert alert-warning">{state.error}</div>}

      <div className="row">
        <DashboardCard index={0} icon={FiUsers} label="Total Students" value={state.studentsTotal} />
        <DashboardCard index={1} icon={FiBriefcase} label="Total Employees" value={state.hr?.totalEmployees ?? '—'} />
        <DashboardCard index={2} icon={FiDollarSign} label="Outstanding Fees" value={`${(state.outstanding ?? 0).toLocaleString()} FCFA`} />
        <DashboardCard index={3} icon={FiClock} label="Pending Leave Requests" value={state.hr?.pendingLeaveRequests ?? '—'} />
      </div>

      <div className="row mt-2">
        <div className="col-lg-7 mb-4">
          <div className="table-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Recent Students</h6>
              <a href="/students" className="small text-decoration-none">See all →</a>
            </div>
            {state.students.length === 0 ? (
              <div className="text-muted text-center py-4">No students yet.</div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr><th>Student</th><th>Program</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {state.students.map((s) => (
                      <tr key={s.id}>
                        <td><RowAvatar name={s.full_name} sub={s.student_number} /></td>
                        <td>{s.program || '—'}</td>
                        <td><Pill status={s.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div className="col-lg-5 mb-4">
          <div className="table-card mb-4">
            <h6 className="mb-3">Employees by Department</h6>
            <BarChart data={chartData} emptyMessage="No employees yet." />
          </div>
          <div className="table-card">
            <h6 className="mb-3">Microservice Health</h6>
            {state.health ? (
              <ul className="list-group list-group-flush">
                {Object.entries(state.health.services).map(([name, info]) => (
                  <li key={name} className="list-group-item d-flex justify-content-between align-items-center px-0">
                    {name}
                    <Pill variant={info.reachable ? 'success' : 'danger'}>{info.status}</Pill>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-muted">Health data unavailable.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
