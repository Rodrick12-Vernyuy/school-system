import React from 'react';

// Plain, restrained page title bar - title + optional subtitle on the
// left, optional actions on the right. Deliberately not a decorative
// banner: professional application shells (GitHub, Vercel, Tailwind UI's
// "Stacked" shell) keep this element quiet and let the content do the
// talking, rather than a large colorful hero card.
export default function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="eduerp-page-header">
      <div>
        {eyebrow && <div className="eduerp-page-eyebrow">{eyebrow}</div>}
        <h1 className="eduerp-page-title">{title}</h1>
        {subtitle && <p className="eduerp-page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="d-flex align-items-center gap-2">{actions}</div>}
    </div>
  );
}
