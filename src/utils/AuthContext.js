import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize isAuthenticated based on localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => JSON.parse(localStorage.getItem('isAuthenticated')) || false
  );

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_URI + '/auth/status', { withCredentials: true });
      console.log("Auth status response:", response.data); // Log the response
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true'); // Persist state in localStorage
    } catch (error) {
      console.error("Auth status check failed", error);
      setIsAuthenticated(false);
      localStorage.setItem('isAuthenticated', 'false'); // Persist state in localStorage
    }
  };

  useEffect(() => {
    checkAuthStatus(); // Check authentication status on app load or refresh
    console.log("Auth Status:", isAuthenticated);
  }, []);

  const logout = async () => {
    await axios.post(process.env.REACT_APP_URI + '/auth/logout', {}, { withCredentials: true });
    setIsAuthenticated(false);
    localStorage.setItem('isAuthenticated', 'false'); // Clear localStorage on logout
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, checkAuthStatus, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
