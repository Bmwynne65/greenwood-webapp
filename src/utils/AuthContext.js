import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => JSON.parse(localStorage.getItem('isAuthenticated')) || false
  );
  const [userRoles, setUserRoles] = useState(
    () => JSON.parse(localStorage.getItem('userRoles')) || []
  );
  const [isActive, setIsActive] = useState(
    () => JSON.parse(localStorage.getItem('isActive')) || false
  );

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_URI}/auth/status`, {
        withCredentials: true,
      });
      setIsAuthenticated(true);
      setUserRoles(response.data.roles || []);
      setIsActive(response.data.active || false);

      // Save to localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRoles', JSON.stringify(response.data.roles || []));
      localStorage.setItem('isActive', JSON.stringify(response.data.active || false));
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        setIsAuthenticated(false);
        setUserRoles([]);
        setIsActive(false);

        // Save to localStorage
        localStorage.setItem('isAuthenticated', 'false');
        localStorage.setItem('userRoles', JSON.stringify([]));
        localStorage.setItem('isActive', JSON.stringify(false));
      }
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_URI}/auth/logout`, {}, { withCredentials: true });
      setIsAuthenticated(false);
      setUserRoles([]);
      setIsActive(false);

      // Clear localStorage
      localStorage.setItem('isAuthenticated', 'false');
      localStorage.setItem('userRoles', JSON.stringify([]));
      localStorage.setItem('isActive', JSON.stringify(false));
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userRoles, isActive, checkAuthStatus, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
