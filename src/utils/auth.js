import {jwtDecode} from 'jwt-decode';

export function getUserRoles() {
  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('authToken='))
    ?.split('=')[1];

  if (!token) return [];

  try {
    const decoded = jwtDecode(token);
    return decoded.roles || [];
  } catch (error) {
    console.error("Error decoding token:", error);
    return [];
  }
}

// Helper function to check if the user has a specific role
export function hasRole(role) {
  const roles = getUserRoles();
  return roles.includes(role);
}

export function getActive() {
  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('authToken='))
    ?.split('=')[1];

  if (!token) return false; // Return false if no token is found

  try {
    const decoded = jwtDecode(token);
    console.log("Decoded Token: ", decoded)
    return Boolean(decoded.active); // Return the boolean value of `active`
  } catch (error) {
    console.error("Error decoding token:", error);
    return false; // Return false if decoding fails
  }
}

export function isActive() {
  return getActive(); // Directly return the boolean result of getActive
}