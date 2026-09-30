import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import Pill from '../../components/Pill.jsx';
import { academicApi } from '../../api/academic.js';

export default function MyCoursesPage() {
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const me = await academicApi.getMyStudentProfile();
    setProfile(me);
    const [allCourses, myEnrollments, myGrades, myAttendance] = await Promise.all([
      academicApi.listCourses(),
      academicApi.listEnrollmentsForStudent(me.id),
      academicApi.listGradesForStudent(me.id),
      academicApi.listAttendanceForStudent(me.id),
    ]);
    setCourses(allCourses.data);
    setEnrollments(myEnrollments.data);
    setGrades(myGrades);
    setAttendance(myAttendance);
  };

  useEffect(() => { load().catch((err) => setError(err.response?.data?.error || 'Could not load your courses.')); }, []);

  const handleEnroll = async (courseId) => {
    setMessage(''); setError('');
    try {
      await academicApi.enroll(profile.id, courseId);
      setMessage('Enrolled! A tuition invoice will appear under "My Invoices & Payments" shortly.');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not enroll in this course.');
    }
  };

  if (error && !profile) return <div className="alert alert-warning">{error}</div>;
  if (!profile) return <div>Loading…</div>;

  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));

  return (
    <div>
      <h4 className="mb-4">My Courses</h4>
      {message && <div className="alert alert-success py-2">{message}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="table-card">
            <h6 className="mb-3">My Enrollments &amp; Grades (GPA: {grades.gpa ?? '—'})</h6>
            <DataTable
              columns={[
                { key: 'code', label: 'Course' },
                { key: 'title', label: 'Title' },
                { key: 'letter_grade', label: 'Grade', render: (r) => r.letter_grade || '—' },
              ]}
              rows={grades.data || []}
              emptyMessage="No grades recorded yet."
            />
          </div>
        </div>
        <div className="col-lg-6 mb-4">
          <div className="table-card">
            <h6 className="mb-3">My Attendance ({attendance?.attendancePercentage ?? 0}%)</h6>
            <DataTable
              columns={[
                { key: 'code', label: 'Course' },
                { key: 'session_date', label: 'Date' },
                { key: 'status', label: 'Status' },
              ]}
              rows={attendance?.data || []}
              emptyMessage="No attendance recorded yet."
            />
          </div>
        </div>
      </div>

      <div className="table-card">
        <h6 className="mb-3">Available Courses</h6>
        <DataTable
          columns={[
            { key: 'code', label: 'Code' },
            { key: 'title', label: 'Title' },
            { key: 'credits', label: 'Credits' },
            { key: 'actions', label: '', render: (r) => (
              enrolledCourseIds.has(r.id)
                ? <Pill variant="success">Enrolled</Pill>
                : <button className="btn btn-sm btn-primary" onClick={() => handleEnroll(r.id)}>Enroll</button>
            ) },
          ]}
          rows={courses}
        />
      </div>
    </div>
  );
}
