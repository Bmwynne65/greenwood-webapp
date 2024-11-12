import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => JSON.parse(localStorage.getItem('isAuthenticated')) || false
  );
  const [userRoles, setUserRoles] = useState([]);
  const [isActive, setIsActive] = useState(false);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_URI}/auth/status`, {
        withCredentials: true
      });
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      // console.log("Is Authenticated?:", isAuthenticated)
      setUserRoles(response.data.roles || []);
      setIsActive(response.data.active || false);
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        setIsAuthenticated(false);
        localStorage.setItem('isAuthenticated', 'false');
        setUserRoles([]);
        setIsActive(false);
      }
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_URI}/auth/logout`, {}, { withCredentials: true });
      setIsAuthenticated(false);
      localStorage.setItem('isAuthenticated', 'false');
      setUserRoles([]);
      setIsActive(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRoles, isActive, checkAuthStatus, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
