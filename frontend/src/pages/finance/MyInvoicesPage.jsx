import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import Pill from '../../components/Pill.jsx';
import { academicApi } from '../../api/academic.js';
import { financeApi } from '../../api/finance.js';

const payDefault = { invoiceId: '', amount: '', method: 'mtn_momo', phoneNumber: '' };

export default function MyInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [payForm, setPayForm] = useState(payDefault);
  const [receipt, setReceipt] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const me = await academicApi.getMyStudentProfile();
    const res = await financeApi.listInvoicesForStudent(me.id);
    setInvoices(res.data);
  };
  useEffect(() => { load().catch((err) => setError(err.response?.data?.error || 'Could not load invoices.')); }, []);

  const handlePay = async (e) => {
    e.preventDefault();
    setMessage(''); setError(''); setReceipt(null);
    try {
      const res = await financeApi.pay({ ...payForm, amount: Number(payForm.amount) });
      setReceipt(res.receipt);
      setMessage('Payment successful.');
      setPayForm(payDefault);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed.');
    }
  };

  return (
    <div>
      <h4 className="mb-4">My Invoices &amp; Payments</h4>
      <p className="text-muted small">
        Payments use a SIMULATED MTN MoMo / Orange Money gateway - no real money moves. A phone number ending in
        "0000" simulates a declined payment, for demo purposes.
      </p>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {message && <div className="alert alert-success py-2">{message}</div>}

      <div className="row">
        <div className="col-lg-7 mb-4">
          <div className="table-card">
            <DataTable
              columns={[
                { key: 'invoice_number', label: 'Invoice #' },
                { key: 'description', label: 'Description' },
                { key: 'amount', label: 'Amount (FCFA)', render: (r) => Number(r.amount).toLocaleString() },
                { key: 'amount_paid', label: 'Paid (FCFA)', render: (r) => Number(r.amount_paid).toLocaleString() },
                { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
              ]}
              rows={invoices}
              emptyMessage="No invoices yet."
            />
          </div>
        </div>
        <div className="col-lg-5 mb-4">
          <div className="table-card">
            <h6 className="mb-3">Pay an Invoice</h6>
            <form onSubmit={handlePay}>
              <select className="form-select form-select-sm mb-2" required value={payForm.invoiceId} onChange={(e) => setPayForm({ ...payForm, invoiceId: e.target.value })}>
                <option value="">Select an invoice…</option>
                {invoices.filter((i) => i.status !== 'paid').map((i) => (
                  <option key={i.id} value={i.id}>{i.invoice_number} - {(i.amount - i.amount_paid).toLocaleString()} FCFA due</option>
                ))}
              </select>
              <input className="form-control form-control-sm mb-2" type="number" placeholder="Amount (FCFA)" required value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} />
              <select className="form-select form-select-sm mb-2" value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}>
                <option value="mtn_momo">MTN MoMo (simulated)</option>
                <option value="orange_money">Orange Money (simulated)</option>
              </select>
              <input className="form-control form-control-sm mb-2" placeholder="Simulated phone number" required value={payForm.phoneNumber} onChange={(e) => setPayForm({ ...payForm, phoneNumber: e.target.value })} />
              <button className="btn btn-primary btn-sm w-100" type="submit">Pay Now</button>
            </form>
            {receipt && (
              <div className="alert alert-light border mt-3">
                <div className="fw-bold">Digital Receipt</div>
                <div className="small">Receipt #: {receipt.receipt_number}</div>
                <div className="small">Amount: {Number(receipt.amount).toLocaleString()} FCFA</div>
                <div className="small">Reference: {receipt.transaction_reference}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
