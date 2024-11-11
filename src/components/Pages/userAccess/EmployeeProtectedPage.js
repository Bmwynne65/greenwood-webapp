import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../../utils/AuthContext';
import { getUserRoles } from '../../../utils/auth';

function EmployeeProtectedPage({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  const roles = getUserRoles();

  console.log("EmployeeProtectedPage - isAuthenticated:", isAuthenticated); // Should be true
  console.log("EmployeeProtectedPage - User roles:", roles); // Should include 'employee'

  if (isAuthenticated && roles && roles.includes('Employee')) {
    return children;
  }

  return <Navigate to="/unauthorized" />;
}

export default EmployeeProtectedPage;
