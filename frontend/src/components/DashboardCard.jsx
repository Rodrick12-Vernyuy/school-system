import React from 'react';

// Colorful stat card matching the reference dashboard: an icon in a tinted
// rounded square, a big value, and a label underneath. `variant` picks one
// of four accent colors defined in index.css (blue/green/pink/orange),
// cycled automatically if not given explicitly.
const VARIANTS = ['blue', 'green', 'pink', 'orange'];

export default function DashboardCard({ label, value, sub, icon: Icon, variant, index = 0 }) {
  const resolvedVariant = variant || VARIANTS[index % VARIANTS.length];
  return (
    <div className="col-sm-6 col-lg-3 mb-3">
      <div className={`card stat-card stat-variant-${resolvedVariant} h-100`}>
        <div className="card-body">
          {Icon && <div className="stat-icon"><Icon /></div>}
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
          {sub && <div className="text-muted small mt-1">{sub}</div>}
        </div>
      </div>
    </div>
  );
}
