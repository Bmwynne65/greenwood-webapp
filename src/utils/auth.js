import { useContext } from 'react';
import { AuthContext } from './AuthContext';

// Custom hook to get user roles from context
export function useUserRoles() {
  const { userRoles } = useContext(AuthContext);
  return userRoles;
}

// Custom hook to check if user has a specific role
export function useHasRole(role) {
  const { userRoles } = useContext(AuthContext);
  return userRoles.includes(role);
}

// Custom hook to get the active status
export function useActiveStatus() {
  const { isActive } = useContext(AuthContext);
  return isActive;
}

// Alias for useActiveStatus if needed
export function useIsActive() {
  return useActiveStatus();
}
