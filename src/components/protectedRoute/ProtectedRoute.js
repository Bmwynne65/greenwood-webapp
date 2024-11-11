import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../../axiosConfig';


function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    api.get('/auth/status') // Backend endpoint to verify authentication
      .then(() => {
        setIsAuthenticated(true);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  if (isAuthenticated === null) return <p>Loading...</p>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
