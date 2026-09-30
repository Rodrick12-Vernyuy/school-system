import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import Pill from '../../components/Pill.jsx';
import { financeApi } from '../../api/finance.js';
import client from '../../api/client.js';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => setInvoices((await financeApi.listInvoices(status ? { status } : {})).data);
  useEffect(() => { load(); }, [status]);

  const sweep = async () => {
    const res = await client.post('/finance/invoices/sweep-overdue');
    setMessage(`${res.data.updated} invoice(s) marked overdue.`);
    load();
  };

  return (
    <div>
      <h4 className="mb-4">Tuition Invoices</h4>
      <p className="text-muted small">
        Invoices are created automatically when a student enrolls (Academic Service publishes a
        <code> student.enrolled</code> event on RabbitMQ; this Finance Service consumes it). All amounts are in FCFA.
      </p>
      {message && <div className="alert alert-info py-2">{message}</div>}
      <div className="table-card">
        <div className="d-flex justify-content-between mb-3">
          <select className="form-select form-select-sm w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
          <button className="btn btn-outline-secondary btn-sm" onClick={sweep}>Sweep Overdue Invoices</button>
        </div>
        <DataTable
          columns={[
            { key: 'invoice_number', label: 'Invoice #' },
            { key: 'student_name', label: 'Student' },
            { key: 'description', label: 'Description' },
            { key: 'amount', label: 'Amount (FCFA)', render: (r) => Number(r.amount).toLocaleString() },
            { key: 'due_date', label: 'Due Date' },
            { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
          ]}
          rows={invoices}
        />
      </div>
    </div>
  );
}
