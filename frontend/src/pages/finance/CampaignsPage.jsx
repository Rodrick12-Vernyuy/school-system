import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import { financeApi } from '../../api/finance.js';

const emptyForm = { name: '', description: '', startDate: '', endDate: '', budget: '' };

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const load = async () => setCampaigns((await financeApi.listCampaigns()).data);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await financeApi.createCampaign({ ...form, budget: Number(form.budget || 0) });
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create campaign.');
    }
  };

  const updateMetrics = async (id, field, value) => {
    await financeApi.updateCampaign(id, { [field]: Number(value) });
    load();
  };

  return (
    <div>
      <h4 className="mb-4">Marketing Campaigns</h4>
      <div className="row">
        <div className="col-lg-8">
          <div className="table-card">
            <DataTable
              columns={[
                { key: 'name', label: 'Campaign' },
                { key: 'budget', label: 'Budget (FCFA)', render: (r) => Number(r.budget).toLocaleString() },
                { key: 'leads', label: 'Leads', render: (r) => (
                  <input type="number" className="form-control form-control-sm" defaultValue={r.leads} style={{ width: 80 }}
                    onBlur={(e) => updateMetrics(r.id, 'leads', e.target.value)} />
                ) },
                { key: 'conversions', label: 'Conversions', render: (r) => (
                  <input type="number" className="form-control form-control-sm" defaultValue={r.conversions} style={{ width: 80 }}
                    onBlur={(e) => updateMetrics(r.id, 'conversions', e.target.value)} />
                ) },
                { key: 'revenue', label: 'Revenue (FCFA)', render: (r) => (
                  <input type="number" className="form-control form-control-sm" defaultValue={r.revenue} style={{ width: 100 }}
                    onBlur={(e) => updateMetrics(r.id, 'revenue', e.target.value)} />
                ) },
                { key: 'conversionRate', label: 'Conv. Rate', render: (r) => `${r.conversionRate}%` },
                { key: 'roi', label: 'ROI', render: (r) => `${r.roi}%` },
              ]}
              rows={campaigns}
            />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="table-card">
            <h6 className="mb-3">New Campaign</h6>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleSubmit}>
              <input className="form-control form-control-sm mb-2" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <textarea className="form-control form-control-sm mb-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="d-flex gap-2 mb-2">
                <input className="form-control form-control-sm" type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                <input className="form-control form-control-sm" type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
              <input className="form-control form-control-sm mb-2" type="number" placeholder="Budget (FCFA)" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
              <button className="btn btn-primary btn-sm w-100" type="submit">Create Campaign</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
