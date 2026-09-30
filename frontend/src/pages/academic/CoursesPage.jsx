import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import { academicApi } from '../../api/academic.js';

const TABS = ['Courses', 'Enroll a Student', 'Enter Grades', 'Record Attendance'];

export default function CoursesPage() {
  const [tab, setTab] = useState('Courses');
  const [courses, setCourses] = useState([]);
  const [courseForm, setCourseForm] = useState({ code: '', title: '', credits: 3, capacity: 40 });
  const [enrollForm, setEnrollForm] = useState({ studentId: '', courseId: '' });
  const [gradeForm, setGradeForm] = useState({ enrollmentId: '', score: '' });
  const [attForm, setAttForm] = useState({ studentId: '', courseId: '', sessionDate: '', status: 'present' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => setCourses((await academicApi.listCourses()).data);
  useEffect(() => { load(); }, []);

  const notify = (fn) => async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      await fn();
      setMessage('Saved.');
    } catch (err) {
      setError(err.response?.data?.error || 'Request failed.');
    }
  };

  return (
    <div>
      <h4 className="mb-4">Courses &amp; Enrollment</h4>
      <ul className="nav nav-tabs mb-3">
        {TABS.map((t) => (
          <li className="nav-item" key={t}>
            <button className={`nav-link ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          </li>
        ))}
      </ul>
      {message && <div className="alert alert-success py-2">{message}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}

      {tab === 'Courses' && (
        <div className="row">
          <div className="col-lg-8">
            <div className="table-card">
              <DataTable
                columns={[
                  { key: 'code', label: 'Code' },
                  { key: 'title', label: 'Title' },
                  { key: 'credits', label: 'Credits' },
                  { key: 'capacity', label: 'Capacity' },
                ]}
                rows={courses}
              />
            </div>
          </div>
          <div className="col-lg-4">
            <div className="table-card">
              <h6 className="mb-3">Create Course</h6>
              <form onSubmit={notify(async () => { await academicApi.createCourse(courseForm); load(); setCourseForm({ code: '', title: '', credits: 3, capacity: 40 }); })}>
                <input className="form-control form-control-sm mb-2" placeholder="Code (e.g. CS101)" required value={courseForm.code} onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })} />
                <input className="form-control form-control-sm mb-2" placeholder="Title" required value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} />
                <input className="form-control form-control-sm mb-2" type="number" placeholder="Credits" value={courseForm.credits} onChange={(e) => setCourseForm({ ...courseForm, credits: Number(e.target.value) })} />
                <input className="form-control form-control-sm mb-2" type="number" placeholder="Capacity" value={courseForm.capacity} onChange={(e) => setCourseForm({ ...courseForm, capacity: Number(e.target.value) })} />
                <button className="btn btn-primary btn-sm w-100" type="submit">Create</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {tab === 'Enroll a Student' && (
        <div className="table-card" style={{ maxWidth: 480 }}>
          <p className="text-muted small">Enrolling triggers the async EduERP workflow: an event is published to RabbitMQ, and the Finance Service automatically creates a tuition invoice.</p>
          <form onSubmit={notify(async () => { await academicApi.enroll(enrollForm.studentId, enrollForm.courseId); })}>
            <label className="form-label small">Student ID (UUID)</label>
            <input className="form-control form-control-sm mb-2" required value={enrollForm.studentId} onChange={(e) => setEnrollForm({ ...enrollForm, studentId: e.target.value })} />
            <label className="form-label small">Course</label>
            <select className="form-select form-select-sm mb-2" required value={enrollForm.courseId} onChange={(e) => setEnrollForm({ ...enrollForm, courseId: e.target.value })}>
              <option value="">Select a course…</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
            </select>
            <button className="btn btn-primary btn-sm w-100" type="submit">Enroll</button>
          </form>
        </div>
      )}

      {tab === 'Enter Grades' && (
        <div className="table-card" style={{ maxWidth: 480 }}>
          <form onSubmit={notify(async () => { await academicApi.enterGrade({ enrollmentId: gradeForm.enrollmentId, score: Number(gradeForm.score) }); })}>
            <label className="form-label small">Enrollment ID (UUID)</label>
            <input className="form-control form-control-sm mb-2" required value={gradeForm.enrollmentId} onChange={(e) => setGradeForm({ ...gradeForm, enrollmentId: e.target.value })} />
            <label className="form-label small">Score (0-100)</label>
            <input className="form-control form-control-sm mb-2" type="number" min="0" max="100" required value={gradeForm.score} onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })} />
            <button className="btn btn-primary btn-sm w-100" type="submit">Save Grade</button>
          </form>
        </div>
      )}

      {tab === 'Record Attendance' && (
        <div className="table-card" style={{ maxWidth: 480 }}>
          <form onSubmit={notify(async () => { await academicApi.recordAttendance(attForm); })}>
            <label className="form-label small">Student ID (UUID)</label>
            <input className="form-control form-control-sm mb-2" required value={attForm.studentId} onChange={(e) => setAttForm({ ...attForm, studentId: e.target.value })} />
            <label className="form-label small">Course</label>
            <select className="form-select form-select-sm mb-2" required value={attForm.courseId} onChange={(e) => setAttForm({ ...attForm, courseId: e.target.value })}>
              <option value="">Select a course…</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
            </select>
            <label className="form-label small">Session Date</label>
            <input className="form-control form-control-sm mb-2" type="date" required value={attForm.sessionDate} onChange={(e) => setAttForm({ ...attForm, sessionDate: e.target.value })} />
            <select className="form-select form-select-sm mb-2" value={attForm.status} onChange={(e) => setAttForm({ ...attForm, status: e.target.value })}>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
            <button className="btn btn-primary btn-sm w-100" type="submit">Save Attendance</button>
          </form>
        </div>
      )}
    </div>
  );
}
