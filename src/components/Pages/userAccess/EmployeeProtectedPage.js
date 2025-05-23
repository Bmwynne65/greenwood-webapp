import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../../utils/AuthContext';
import { useHasRole, useIsActive } from '../../../utils/auth';

function EmployeeProtectedPage({ children, redirectTo = '/unauthorized' }) {
  const { isAuthenticated } = useContext(AuthContext);
  const hasGuestRole = useHasRole('Guest')
  const hasEmployeeRole = useHasRole('Employee')
  const hasManagerRole = useHasRole('Manager')
  const hasAdminRole = useHasRole('Admin')
  const isActive = useIsActive();

  console.log("EmployeeProtectedPage - isAuthenticated:", isAuthenticated); // Should be true
  console.log("EmployeeProtectedPage - Role: ", hasAdminRole);
  console.log("EmployeeProtectedPage - isActive:", isActive);
  if (isAuthenticated && hasEmployeeRole && isActive) {
    return children;
  }

  return (isAuthenticated && (hasEmployeeRole || hasAdminRole || hasManagerRole || hasGuestRole) && isActive) ? children : <Navigate to={redirectTo} />;
  // return <Navigate to="/unauthorized" />;
}

export default EmployeeProtectedPage;
