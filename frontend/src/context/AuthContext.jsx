'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('roseo_token');
      if (token) {
        const data = await api.getProfile();
        setUser(data);
        setIsAdmin(data.role === 'admin');
      }
    } catch (error) {
      localStorage.removeItem('roseo_token');
      localStorage.removeItem('roseo_user');
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('roseo_token', data.token);
    localStorage.setItem('roseo_user', JSON.stringify(data.user));
    setUser(data.user);
    setIsAdmin(data.user.role === 'admin');
    return data;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    localStorage.setItem('roseo_token', data.token);
    localStorage.setItem('roseo_user', JSON.stringify(data.user));
    setUser(data.user);
    setIsAdmin(data.user.role === 'admin');
    return data;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('roseo_token');
    localStorage.removeItem('roseo_user');
    setUser(null);
    setIsAdmin(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
