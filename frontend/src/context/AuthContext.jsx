import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => authService.getToken());
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Restore session via GET /api/auth/me on app load
  const restoreSession = useCallback(async () => {
    const storedToken = authService.getToken();
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await authService.getMe();
      if (data && data.user) {
        setUser(data.user);
        setToken(storedToken);
      } else {
        throw new Error('Failed to retrieve user profile');
      }
    } catch (err) {
      console.warn('Session restoration failed:', err.message);
      // Stored token is invalid or expired
      authService.removeToken();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  /**
   * Login user with identifier (email/username) and password
   */
  const login = async (credentials) => {
    setAuthError(null);
    try {
      const data = await authService.login(credentials);
      if (data.token) {
        authService.setToken(data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
      throw new Error(data.message || 'Login failed');
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setAuthError(msg);
      throw err;
    }
  };

  /**
   * Register a new user
   */
  const register = async (userData) => {
    setAuthError(null);
    try {
      const data = await authService.register(userData);
      if (data.token) {
        authService.setToken(data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
      throw new Error(data.message || 'Registration failed');
    } catch (err) {
      const msg = err.message || 'Registration failed.';
      setAuthError(msg);
      throw err;
    }
  };

  /**
   * Logout user, clear state and localStorage
   */
  const logout = () => {
    authService.removeToken();
    setToken(null);
    setUser(null);
    setAuthError(null);
  };

  const value = {
    user,
    token,
    loading,
    authError,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    restoreSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
