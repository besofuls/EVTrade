import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowRoles }) => {
  // Check if user is authenticated by looking for userData in localStorage
  const userData = localStorage.getItem('user') || localStorage.getItem('userData');
  
  console.log('ProtectedRoute: Checking userData:', userData ? 'Found' : 'Not found');
  
  // If no user data, redirect to login page
  if (!userData) {
    console.log('ProtectedRoute: No userData, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  try {
    // Verify that userData is valid JSON
    const parsedData = JSON.parse(userData);

    // Optional role guarding
    if (Array.isArray(allowRoles) && allowRoles.length > 0) {
      const roleName = parsedData?.role?.roleName || parsedData?.roleName || parsedData?.role;
      if (!roleName || !allowRoles.map(r => r.toLowerCase()).includes(String(roleName).toLowerCase())) {
        console.log('ProtectedRoute: Role not allowed, redirecting to home');
        return <Navigate to="/" replace />;
      }
    }

    console.log('ProtectedRoute: Valid userData found, allowing access:', parsedData);
    return children;
  } catch (error) {
    // If userData is corrupted, clear it and redirect to login
    console.log('ProtectedRoute: Corrupted userData, clearing and redirecting');
    localStorage.removeItem('userData');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;