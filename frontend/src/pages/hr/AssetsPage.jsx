import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import { hrApi } from '../../api/hr.js';

const emptyForm = { name: '', category: '', value: '', assignedEmployeeId: '' };

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setAssets((await hrApi.listAssets()).data);
    setEmployees((await hrApi.listEmployees()).data);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await hrApi.createAsset({ ...form, value: Number(form.value || 0), assignedEmployeeId: form.assignedEmployeeId || null });
    setForm(emptyForm);
    load();
  };

  return (
    <div>
      <h4 className="mb-4">Asset Management</h4>
      <div className="row">
        <div className="col-lg-8">
          <div className="table-card">
            <DataTable
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'category', label: 'Category' },
                { key: 'value', label: 'Value (FCFA)', render: (r) => Number(r.value).toLocaleString() },
                { key: 'status', label: 'Status' },
              ]}
              rows={assets}
            />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="table-card">
            <h6 className="mb-3">Add Asset</h6>
            <form onSubmit={handleSubmit}>
              <input className="form-control form-control-sm mb-2" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="form-control form-control-sm mb-2" placeholder="Category (e.g. Computer)" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <input className="form-control form-control-sm mb-2" type="number" placeholder="Value (FCFA)" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
              <select className="form-select form-select-sm mb-2" value={form.assignedEmployeeId} onChange={(e) => setForm({ ...form, assignedEmployeeId: e.target.value })}>
                <option value="">Unassigned</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
              </select>
              <button className="btn btn-primary btn-sm w-100" type="submit">Add Asset</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
