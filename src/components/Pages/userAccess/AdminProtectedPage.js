import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../../utils/AuthContext';
import { getUserRoles } from '../../../utils/auth';
import { isActive } from '../../../utils/auth';

function AdminProtectedPage({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  const roles = getUserRoles();

  console.log("AdminProtectedPage - isAuthenticated:", isAuthenticated); // Should be true
  console.log("AdminProtectedPage - User roles:", roles); // Should include 'admin'

  if (isAuthenticated && roles && (roles.includes('Admin') || (roles.includes('Manager') && isActive()))) {
    return children;
  }

  return <Navigate to="/unauthorized" />;
}

export default AdminProtectedPage;
