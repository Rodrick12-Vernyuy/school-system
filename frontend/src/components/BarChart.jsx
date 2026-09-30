import React from 'react';

// Small, dependency-free bar chart (flexbox + CSS, no charting library).
// `data` = [{ label, value }]. Bar heights are scaled relative to the
// largest value in the set so the chart always fits its container.
export default function BarChart({ data, emptyMessage = 'No data yet.' }) {
  if (!data || data.length === 0) {
    return <div className="text-muted text-center py-5">{emptyMessage}</div>;
  }
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="eduerp-bar-chart">
      {data.map((d) => (
        <div className="eduerp-bar-col" key={d.label}>
          <div className="fw-semibold small">{d.value}</div>
          <div className="eduerp-bar" style={{ height: `${Math.max((d.value / max) * 100, 4)}%` }} />
          <div className="eduerp-bar-label">{d.label}</div>
        </div>
      ))}
    </div>
  );
}
