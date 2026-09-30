import React from 'react';

// Small circular initials avatar for table rows (students, employees, etc.),
// matching the reference UI's "photo + name" table cells without needing
// real profile photos.
function initialsFor(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';
}

export default function RowAvatar({ name, sub }) {
  return (
    <span className="d-inline-flex align-items-center">
      <span className="row-avatar">{initialsFor(name)}</span>
      <span>
        <div className="fw-semibold" style={{ fontSize: '0.88rem' }}>{name}</div>
        {sub && <div className="small text-muted">{sub}</div>}
      </span>
    </span>
  );
}
