import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getUser());
  const [token, setToken] = useState(() => authService.getToken());
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Validate session on app launch
  useEffect(() => {
    let isCancelled = false;

    const verifySession = async () => {
      const existingToken = authService.getToken();
      if (!existingToken) {
        if (!isCancelled) {
          setUser(null);
          setToken(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const officerProfile = await authService.getMe();
        if (!isCancelled) {
          setUser(officerProfile);
          setToken(existingToken);
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('[AuthContext] Session validation failed:', err.message);
        if (!isCancelled) {
          authService.clearSession();
          setUser(null);
          setToken(null);
          setIsLoading(false);
        }
      }
    };

    verifySession();

    // Listen for 401 unauthorized session expiry
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
      setAuthError('Your officer session has expired. Please authenticate again.');
    };

    window.addEventListener('railopt:auth_expired', handleAuthExpired);
    return () => {
      isCancelled = true;
      window.removeEventListener('railopt:auth_expired', handleAuthExpired);
    };
  }, []);

  const login = useCallback(async (officerId, password) => {
    setAuthError(null);
    try {
      const result = await authService.login(officerId, password);
      setUser(result.officer);
      setToken(result.token);
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Authentication failed. Please verify credentials.';
      setAuthError(errorMsg);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setToken(null);
      setAuthError(null);
    }
  }, []);

  const hasRole = useCallback((requiredRole) => {
    if (!user || !user.role) return false;
    if (user.role === 'ADMIN') return true;
    return user.role === requiredRole;
  }, [user]);

  const hasDepartment = useCallback((requiredDept) => {
    if (!user || !user.department) return false;
    if (user.role === 'ADMIN') return true;
    return user.department === requiredDept;
  }, [user]);

  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        authError,
        setAuthError,
        login,
        logout,
        hasRole,
        hasDepartment
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
