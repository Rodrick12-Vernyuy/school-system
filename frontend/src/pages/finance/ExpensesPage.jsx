import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import { financeApi } from '../../api/finance.js';

const emptyForm = { category: '', description: '', amount: '' };

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const load = async () => setExpenses((await financeApi.listExpenses()).data);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await financeApi.createExpense({ ...form, amount: Number(form.amount) });
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save expense.');
    }
  };

  return (
    <div>
      <h4 className="mb-4">Expenses</h4>
      <div className="row">
        <div className="col-lg-8">
          <div className="table-card">
            <DataTable
              columns={[
                { key: 'category', label: 'Category' },
                { key: 'description', label: 'Description' },
                { key: 'amount', label: 'Amount (FCFA)', render: (r) => Number(r.amount).toLocaleString() },
                { key: 'expense_date', label: 'Date' },
              ]}
              rows={expenses}
            />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="table-card">
            <h6 className="mb-3">Add Expense</h6>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleSubmit}>
              <input className="form-control form-control-sm mb-2" placeholder="Category (e.g. Utilities)" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <input className="form-control form-control-sm mb-2" placeholder="Description" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <input className="form-control form-control-sm mb-2" type="number" placeholder="Amount (FCFA)" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              <button className="btn btn-primary btn-sm w-100" type="submit">Add Expense</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
