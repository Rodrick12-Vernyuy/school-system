import React, { useEffect, useState } from 'react';
import { FiAward, FiCalendar, FiBookOpen, FiActivity } from 'react-icons/fi';
import DashboardCard from '../../components/DashboardCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { academicApi } from '../../api/academic.js';

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [grades, setGrades] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [risk, setRisk] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const me = await academicApi.getMyStudentProfile();
        setProfile(me);
        const [gradesData, attendanceData, riskData] = await Promise.all([
          academicApi.listGradesForStudent(me.id),
          academicApi.listAttendanceForStudent(me.id),
          academicApi.riskStatus(me.id),
        ]);
        setGrades(gradesData);
        setAttendance(attendanceData);
        setRisk(riskData);
      } catch (err) {
        setError(err.response?.data?.error || 'Could not load your student profile.');
      }
    })();
  }, []);

  if (error) return <div className="alert alert-warning">{error}</div>;
  if (!profile) return <div>Loading your dashboard…</div>;

  return (
    <div>
      <PageHeader
        eyebrow="Student"
        title={`Welcome, ${profile.full_name}`}
        subtitle={`Student number ${profile.student_number} · ${profile.program || 'Program not set'} · Status: ${profile.status}`}
      />

      {risk?.atRisk && (
        <div className="alert alert-danger">
          <strong>At-risk status:</strong> You have been flagged as at-risk ({risk.reasons.join(', ').replace(/_/g, ' ')}).
          Please contact your academic advisor.
        </div>
      )}

      <div className="row">
        <DashboardCard index={0} icon={FiAward} label="GPA" value={grades?.gpa ?? '—'} />
        <DashboardCard index={1} icon={FiCalendar} label="Attendance" value={attendance ? `${attendance.attendancePercentage ?? 0}%` : '—'} />
        <DashboardCard index={2} icon={FiBookOpen} label="Courses Graded" value={grades?.data?.length ?? 0} />
        <DashboardCard index={3} icon={FiActivity} label="Status" value={risk?.atRisk ? 'At Risk' : 'Good Standing'} />
      </div>
    </div>
  );
}
