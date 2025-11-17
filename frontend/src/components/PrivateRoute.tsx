import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services';
import { PrivateRouteProps } from '../types';

/**
 * Route wrapper that requires authentication
 * Redirects to login if user is not authenticated
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
