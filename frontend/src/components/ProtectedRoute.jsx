// Enforces role-based access control on the frontend, mirroring the
// enforcement each backend service already performs independently. This is
// a UX convenience (hide/redirect away from screens a role cannot use) -
// it is NOT the security boundary; the API Gateway and each microservice
// re-check the JWT and role on every request regardless of what the UI
// shows, so a user cannot bypass authorization just by editing frontend code.
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
