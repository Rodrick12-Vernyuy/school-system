import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import DashboardCard from '../../components/DashboardCard.jsx';
import { financeApi } from '../../api/finance.js';

export default function ReportsPage() {
  const [daily, setDaily] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [outstanding, setOutstanding] = useState(null);

  useEffect(() => {
    (async () => {
      setDaily(await financeApi.dailySummary());
      setMonthly(await financeApi.monthlySummary());
      setOutstanding(await financeApi.outstandingFees());
    })();
  }, []);

  return (
    <div>
      <h4 className="mb-4">Financial Reports</h4>
      <div className="row">
        <DashboardCard label="Today's Income" value={`${(daily?.income ?? 0).toLocaleString()} FCFA`} />
        <DashboardCard label="Today's Expenses" value={`${(daily?.expenses ?? 0).toLocaleString()} FCFA`} />
        <DashboardCard label="Month Net" value={`${(monthly?.net ?? 0).toLocaleString()} FCFA`} />
        <DashboardCard label="Total Outstanding" value={`${(outstanding?.totalOutstanding ?? 0).toLocaleString()} FCFA`} />
      </div>
      <div className="table-card">
        <h6 className="mb-3">Outstanding Fees</h6>
        <DataTable
          columns={[
            { key: 'invoice_number', label: 'Invoice #' },
            { key: 'student_name', label: 'Student' },
            { key: 'outstanding', label: 'Outstanding (FCFA)', render: (r) => Number(r.outstanding).toLocaleString() },
            { key: 'due_date', label: 'Due Date' },
            { key: 'status', label: 'Status' },
          ]}
          rows={outstanding?.data || []}
        />
      </div>
    </div>
  );
}
