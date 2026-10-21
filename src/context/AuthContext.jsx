import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize session by checking /auth/me on startup
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = await authService.getMe();
      setUser(currentUser || null);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // Listen to session expiry events dispatched by axios interceptor
    const handleSessionExpired = () => {
      setUser(null);
      setAuthError('Your session has expired. Please log in again.');
    };

    window.addEventListener('janaseva:session_expired', handleSessionExpired);
    return () => window.removeEventListener('janaseva:session_expired', handleSessionExpired);
  }, [checkAuth]);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await authService.login(email, password);
      const loggedInUser = res?.data?.user;
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Login failed. Please check your credentials.';
      setAuthError(msg);
      throw err;
    }
  };

  const register = async (data) => {
    setAuthError(null);
    try {
      const res = await authService.register(data);
      const registeredUser = res?.data?.user;
      if (registeredUser && !res?.data?.requiresVerification) {
        setUser(registeredUser);
      }
      return res?.data;
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Registration failed. Please try again.';
      setAuthError(msg);
      throw err;
    }
  };

  const verifyContact = async (data) => {
    setAuthError(null);
    try {
      const res = await authService.verifyContact(data);
      const verifiedUser = res?.data?.user;
      setUser(verifiedUser);
      return verifiedUser;
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Verification failed. Please check your code.';
      setAuthError(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setAuthError(null);
    }
  };

  const refreshUser = async () => {
    try {
      const updatedUser = await authService.getMe();
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      return null;
    }
  };

  const updateUser = useCallback((userData) => {
    setUser((prev) => {
      const nextUser = prev ? { ...prev, ...userData } : userData;
      if (nextUser?.role === 'admin' && localStorage.getItem('janaseva_admin')) {
        try {
          localStorage.setItem('janaseva_admin', JSON.stringify(nextUser));
        } catch (e) {}
      }
      return nextUser;
    });
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isVerified: Boolean(user?.isContactVerified && user?.status === 'active'),
    loading,
    authError,
    clearAuthError: () => setAuthError(null),
    login,
    register,
    verifyContact,
    logout,
    refreshUser,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
