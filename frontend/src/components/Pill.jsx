import React from 'react';

// Colored status pill matching the reference UI's "Payment Due / Received /
// Request Sent" style badges. Maps common status strings to a variant;
// pass `variant` explicitly to override.
const STATUS_VARIANT = {
  active: 'success', paid: 'success', approved: 'success', present: 'success', selected: 'success', ok: 'success',
  pending: 'warning', partially_paid: 'warning', late: 'warning', applied: 'warning', interview: 'warning',
  inactive: 'danger', overdue: 'danger', rejected: 'danger', absent: 'danger', suspended: 'danger', unreachable: 'danger',
  enrolled: 'info', dropped: 'neutral', completed: 'info',
};

export default function Pill({ status, variant, children }) {
  const resolved = variant || STATUS_VARIANT[status] || 'neutral';
  return <span className={`pill pill-${resolved}`}>{children ?? String(status).replace(/_/g, ' ')}</span>;
}
