import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../../utils/AuthContext';
import { useHasRole, useIsActive } from '../../../utils/auth';

function GuestProtectedPage({ children, redirectTo = '/unauthorized' }) {
  const { isAuthenticated } = useContext(AuthContext);
  const hasGuestRole = useHasRole('Guest')
  const hasEmployeeRole = useHasRole('Employee')
  const hasManagerRole = useHasRole('Manager')
  const hasAdminRole = useHasRole('Admin')
  const isActive = useIsActive();

//   console.log("GuestProtectedPage - isAuthenticated:", isAuthenticated); // Should be true
  // console.log("GuestProtectedPage - User roles:", roles); // Should include 'employee'

  if (isAuthenticated && hasGuestRole && isActive) {
    return children;
  }

  return (isAuthenticated && (hasGuestRole || hasEmployeeRole || hasManagerRole || hasAdminRole) && isActive) ? children : <Navigate to={redirectTo} />;
  // return <Navigate to="/unauthorized" />;
}

export default GuestProtectedPage;
