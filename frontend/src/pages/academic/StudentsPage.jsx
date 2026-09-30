import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import Pill from '../../components/Pill.jsx';
import RowAvatar from '../../components/RowAvatar.jsx';
import { academicApi } from '../../api/academic.js';

const emptyForm = { studentNumber: '', fullName: '', email: '', phone: '', program: '', level: '' };

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const res = await academicApi.listStudents(search ? { search } : {});
    setStudents(res.data);
  };

  useEffect(() => { load(); }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await academicApi.createStudent(form);
      setForm(emptyForm);
      setMessage('Student added.');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not add student.');
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this student?')) return;
    await academicApi.deactivateStudent(id);
    load();
  };

  return (
    <div>
      <h4 className="mb-4">Student Management</h4>
      <div className="row">
        <div className="col-lg-8">
          <div className="table-card mb-4">
            <div className="d-flex justify-content-between mb-3">
              <h6>All Students</h6>
              <input className="form-control form-control-sm w-auto" placeholder="Search by name, number, or email"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <DataTable
              columns={[
                { key: 'full_name', label: 'Student', render: (r) => <RowAvatar name={r.full_name} sub={r.student_number} /> },
                { key: 'program', label: 'Program' },
                { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
                { key: 'actions', label: '', render: (r) => (
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeactivate(r.id)} disabled={r.status !== 'active'}>Deactivate</button>
                ) },
              ]}
              rows={students}
            />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="table-card">
            <h6 className="mb-3">Add Student</h6>
            {message && <div className="alert alert-success py-2">{message}</div>}
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleCreate}>
              {['studentNumber', 'fullName', 'email', 'phone', 'program', 'level'].map((field) => (
                <div className="mb-2" key={field}>
                  <input
                    className="form-control form-control-sm"
                    placeholder={field}
                    value={form[field]}
                    required={['studentNumber', 'fullName', 'email'].includes(field)}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  />
                </div>
              ))}
              <button className="btn btn-primary btn-sm w-100" type="submit">Add Student</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
