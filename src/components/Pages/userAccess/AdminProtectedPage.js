import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../../utils/AuthContext';
import { useHasRole, useIsActive } from '../../../utils/auth';

function AdminProtectedPage({ children, redirectTo = '/unauthorized' }) {
  const { isAuthenticated } = useContext(AuthContext);
  const hasAdminRole = useHasRole('Admin');
  const hasManagerRole = useHasRole('Manager')
  const isActive = useIsActive();

  // console.log("AdminProtectedPage - isAuthenticated:", isAuthenticated); // Should be true
  // console.log("AdminProtectedPage - User roles:", roles); // Should include 'admin'

  if (isAuthenticated && (hasAdminRole || (hasManagerRole && isActive)) && isActive) {
    return children;
  }

  return isAuthenticated ? children : <Navigate to={redirectTo} />;
  // return <Navigate to="/unauthorized" />;
}

export default AdminProtectedPage;
