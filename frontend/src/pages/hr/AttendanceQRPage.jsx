import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import { hrApi } from '../../api/hr.js';

export default function AttendanceQRPage() {
  const [token, setToken] = useState('');
  const [today, setToday] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => setToday((await hrApi.listAttendanceForDate(new Date().toISOString().slice(0, 10))).data);
  useEffect(() => { load(); }, []);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      const res = await hrApi.checkInQr(token);
      setMessage(`Checked in: ${res.employee.full_name}`);
      setToken('');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Check-in failed.');
    }
  };

  return (
    <div>
      <h4 className="mb-4">QR-Code Attendance</h4>
      <p className="text-muted small">
        In a live deployment, each employee's QR code (visible on their profile) is scanned by a camera. For this
        demo, paste or type the employee's QR token below to simulate a scan.
      </p>
      <div className="row">
        <div className="col-lg-5 mb-4">
          <div className="table-card">
            <h6 className="mb-3">Scan / Enter QR Code</h6>
            {message && <div className="alert alert-success py-2">{message}</div>}
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleCheckIn}>
              <input className="form-control form-control-sm mb-2" placeholder="QR token" required value={token} onChange={(e) => setToken(e.target.value)} />
              <button className="btn btn-primary btn-sm w-100" type="submit">Check In</button>
            </form>
          </div>
        </div>
        <div className="col-lg-7 mb-4">
          <div className="table-card">
            <h6 className="mb-3">Today's Check-ins</h6>
            <DataTable
              columns={[
                { key: 'full_name', label: 'Employee' },
                { key: 'department', label: 'Department' },
                { key: 'check_in_time', label: 'Time', render: (r) => new Date(r.check_in_time).toLocaleTimeString() },
              ]}
              rows={today}
              emptyMessage="No check-ins yet today."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
