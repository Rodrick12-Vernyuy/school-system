import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import { hrApi } from '../../api/hr.js';

const emptyForm = { candidateName: '', candidateEmail: '', position: '' };
const STATUSES = ['applied', 'interview', 'selected', 'rejected'];

export default function RecruitmentPage() {
  const [candidates, setCandidates] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const load = async () => setCandidates((await hrApi.listRecruitment()).data);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await hrApi.createCandidate(form);
    setForm(emptyForm);
    load();
  };

  const updateStatus = async (id, status) => {
    await hrApi.updateCandidateStatus(id, status);
    load();
  };

  return (
    <div>
      <h4 className="mb-4">Recruitment</h4>
      <div className="row">
        <div className="col-lg-8">
          <div className="table-card">
            <DataTable
              columns={[
                { key: 'candidate_name', label: 'Candidate' },
                { key: 'position', label: 'Position' },
                { key: 'application_date', label: 'Applied' },
                { key: 'status', label: 'Status', render: (r) => (
                  <select className="form-select form-select-sm" value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) },
              ]}
              rows={candidates}
            />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="table-card">
            <h6 className="mb-3">Add Candidate</h6>
            <form onSubmit={handleSubmit}>
              <input className="form-control form-control-sm mb-2" placeholder="Candidate Name" required value={form.candidateName} onChange={(e) => setForm({ ...form, candidateName: e.target.value })} />
              <input className="form-control form-control-sm mb-2" placeholder="Email" value={form.candidateEmail} onChange={(e) => setForm({ ...form, candidateEmail: e.target.value })} />
              <input className="form-control form-control-sm mb-2" placeholder="Position" required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
              <button className="btn btn-primary btn-sm w-100" type="submit">Add Candidate</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
