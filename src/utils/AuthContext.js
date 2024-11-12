import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRoles, setUserRoles] = useState([]);
  const [isActive, setIsActive] = useState(false);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_URI}/auth/status`, {
        withCredentials: true
      });
      
      setIsAuthenticated(true);
      setUserRoles(response.data.roles || []);
      setIsActive(response.data.active || false);
    } catch (error) {
      console.error("Auth status check failed", error);
      setIsAuthenticated(false);
      setUserRoles([]);
      setIsActive(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const logout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_URI}/auth/logout`, {}, { withCredentials: true });
      document.cookie = 'authToken=; Max-Age=0; path=/;'; // Clear the authToken cookie on client side
      setIsAuthenticated(false);
      setUserRoles([]);
      setIsActive(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRoles, isActive, checkAuthStatus, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
