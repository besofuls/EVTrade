import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated by looking for userData in localStorage
  const userData = localStorage.getItem('userData');
  
  console.log('ProtectedRoute: Checking userData:', userData ? 'Found' : 'Not found');
  
  // If no user data, redirect to login page
  if (!userData) {
    console.log('ProtectedRoute: No userData, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  try {
    // Verify that userData is valid JSON
    const parsedData = JSON.parse(userData);
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