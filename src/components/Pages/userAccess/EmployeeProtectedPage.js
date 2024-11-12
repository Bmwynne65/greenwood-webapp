import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../../utils/AuthContext';
import { useHasRole, useIsActive } from '../../../utils/auth';

function EmployeeProtectedPage({ children, redirectTo = '/unauthorized' }) {
  const { isAuthenticated } = useContext(AuthContext);
  const hasEmployeeRole = useHasRole('Employee')
  const isActive = useIsActive();

  // console.log("EmployeeProtectedPage - isAuthenticated:", isAuthenticated); // Should be true
  // console.log("EmployeeProtectedPage - User roles:", roles); // Should include 'employee'

  if (isAuthenticated && hasEmployeeRole && isActive) {
    return children;
  }

  return isAuthenticated ? children : <Navigate to={redirectTo} />;
  // return <Navigate to="/unauthorized" />;
}

export default EmployeeProtectedPage;
