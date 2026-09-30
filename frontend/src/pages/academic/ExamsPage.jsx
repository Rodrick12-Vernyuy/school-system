import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import { academicApi } from '../../api/academic.js';

const emptyForm = { courseId: '', examDate: '', startTime: '', endTime: '', room: '' };

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setExams((await academicApi.listExams()).data);
    setCourses((await academicApi.listCourses()).data);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      await academicApi.scheduleExam(form);
      setMessage('Examination scheduled.');
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not schedule examination (possible room/time conflict).');
    }
  };

  return (
    <div>
      <h4 className="mb-4">Examination Scheduling</h4>
      <div className="row">
        <div className="col-lg-8">
          <div className="table-card">
            <DataTable
              columns={[
                { key: 'code', label: 'Course' },
                { key: 'exam_date', label: 'Date' },
                { key: 'start_time', label: 'Start' },
                { key: 'end_time', label: 'End' },
                { key: 'room', label: 'Room' },
              ]}
              rows={exams}
            />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="table-card">
            <h6 className="mb-3">Schedule Exam</h6>
            {message && <div className="alert alert-success py-2">{message}</div>}
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleSubmit}>
              <select className="form-select form-select-sm mb-2" required value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
                <option value="">Select a course…</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
              </select>
              <input className="form-control form-control-sm mb-2" type="date" required value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} />
              <div className="d-flex gap-2 mb-2">
                <input className="form-control form-control-sm" type="time" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                <input className="form-control form-control-sm" type="time" required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
              </div>
              <input className="form-control form-control-sm mb-2" placeholder="Room" required value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
              <button className="btn btn-primary btn-sm w-100" type="submit">Schedule</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
