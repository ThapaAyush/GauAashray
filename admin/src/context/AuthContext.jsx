import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gau_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('gau_admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('gau_admin_token');
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success && res.data.user.role === 'SUPER_ADMIN') {
          setUser(res.data.user);
          localStorage.setItem('gau_admin_user', JSON.stringify(res.data.user));
        } else {
          // If not SUPER_ADMIN, deny access to admin portal
          logout();
        }
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', {
      loginId: identifier.trim(),
      phoneOrEmail: identifier.trim(),
      password
    });

    if (res.data.success) {
      if (res.data.user.role !== 'SUPER_ADMIN') {
        throw new Error('Access denied: You need Super Admin privileges to access this portal.');
      }
      localStorage.setItem('gau_admin_token', res.data.token);
      localStorage.setItem('gau_admin_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    } else {
      throw new Error(res.data.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('gau_admin_token');
    localStorage.removeItem('gau_admin_user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (formData) => {
    const res = await api.put('/auth/profile', formData);
    if (res.data.success && res.data.user) {
      setUser(res.data.user);
      localStorage.setItem('gau_admin_user', JSON.stringify(res.data.user));
      return res.data;
    }
  };

  const deleteAvatar = async () => {
    const res = await api.delete('/auth/avatar');
    if (res.data.success && res.data.user) {
      setUser(res.data.user);
      localStorage.setItem('gau_admin_user', JSON.stringify(res.data.user));
      return res.data;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateProfile, deleteAvatar, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

