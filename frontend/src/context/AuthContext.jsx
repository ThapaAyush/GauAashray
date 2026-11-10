import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gauaashray_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeRole, setActiveRole] = useState(() => {
    const savedRole = localStorage.getItem('gauaashray_active_role');
    if (savedRole) return savedRole;
    const saved = localStorage.getItem('gauaashray_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.activeRole || parsed.role || 'PUBLIC_USER';
      } catch (e) {}
    }
    return 'PUBLIC_USER';
  });
  const [token, setToken] = useState(() => localStorage.getItem('gauaashray_token'));
  const [loading, setLoading] = useState(true);
  const [activeBranch, setActiveBranch] = useState(null);
  const [branches, setBranches] = useState([]);

  // Check current auth on startup
  const checkAuth = async () => {
    const storedToken = localStorage.getItem('gauaashray_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('gauaashray_user', JSON.stringify(res.data.user));

        // If Gaushala owner, load their branches
        if (res.data.user.role === 'GAUSHALA_OWNER') {
          try {
            const bRes = await api.get('/gaushalas/my-branches');
            if (bRes.data.success && bRes.data.branches) {
              setBranches(bRes.data.branches);
              if (bRes.data.branches.length > 0 && !activeBranch) {
                setActiveBranch(bRes.data.branches[0]);
              }
            }
          } catch (e) {
            // Might be pending approval
          }
        }
      }
    } catch (err) {
      console.error('Auth verification failed:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (loginId, password) => {
    const res = await api.post('/auth/login', { loginId, password });
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('gauaashray_token', newToken);
      localStorage.setItem('gauaashray_user', JSON.stringify(newUser));
      const initialActiveRole = newUser.activeRole || newUser.role || 'PUBLIC_USER';
      setActiveRole(initialActiveRole);
      localStorage.setItem('gauaashray_active_role', initialActiveRole);
      setToken(newToken);
      setUser(newUser);

      if (newUser.role === 'GAUSHALA_OWNER') {
        try {
          const bRes = await api.get('/gaushalas/my-branches');
          if (bRes.data.branches && bRes.data.branches.length > 0) {
            setBranches(bRes.data.branches);
            setActiveBranch(bRes.data.branches[0]);
          }
        } catch (e) {}
      }
      return res.data;
    }
  };

  const registerPublic = async (formData) => {
    const res = await api.post('/auth/register/public', formData);
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('gauaashray_token', newToken);
      localStorage.setItem('gauaashray_user', JSON.stringify(newUser));
      const initialActiveRole = newUser.activeRole || newUser.role || 'PUBLIC_USER';
      setActiveRole(initialActiveRole);
      localStorage.setItem('gauaashray_active_role', initialActiveRole);
      setToken(newToken);
      setUser(newUser);
      return res.data;
    }
  };

  const registerGaushala = async (formData) => {
    const res = await api.post('/auth/register/gaushala', formData);
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('gauaashray_token', newToken);
      localStorage.setItem('gauaashray_user', JSON.stringify(newUser));
      const initialActiveRole = newUser.activeRole || newUser.role || 'PUBLIC_USER';
      setActiveRole(initialActiveRole);
      localStorage.setItem('gauaashray_active_role', initialActiveRole);
      setToken(newToken);
      setUser(newUser);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('gauaashray_token');
    localStorage.removeItem('gauaashray_user');
    setUser(null);
    setToken(null);
    setActiveBranch(null);
    setBranches([]);
    api.post('/auth/logout').catch(() => {});
  };

  const updateProfile = async (formData) => {
    const res = await api.put('/auth/profile', formData);
    if (res.data.success && res.data.user) {
      setUser(res.data.user);
      localStorage.setItem('gauaashray_user', JSON.stringify(res.data.user));
      return res.data;
    }
  };

  const deleteAvatar = async () => {
    const res = await api.delete('/auth/avatar');
    if (res.data.success && res.data.user) {
      setUser(res.data.user);
      localStorage.setItem('gauaashray_user', JSON.stringify(res.data.user));
      return res.data;
    }
  };

  const switchRole = async (targetRole) => {
    try {
      const res = await api.put('/auth/switch-role', { targetRole });
      if (res.data.success) {
        setActiveRole(targetRole);
        localStorage.setItem('gauaashray_active_role', targetRole);
        const updatedUser = { ...user, activeRole: targetRole };
        setUser(updatedUser);
        localStorage.setItem('gauaashray_user', JSON.stringify(updatedUser));

        // If switching to GAUSHALA_OWNER, ensure branches are loaded
        if (targetRole === 'GAUSHALA_OWNER' && branches.length === 0) {
          try {
            const bRes = await api.get('/gaushalas/my-branches');
            if (bRes.data.branches && bRes.data.branches.length > 0) {
              setBranches(bRes.data.branches);
              setActiveBranch(bRes.data.branches[0]);
            }
          } catch (e) {}
        }

        return res.data;
      }
    } catch (err) {
      throw err;
    }
  };

  const refreshUser = () => {
    return checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        activeRole,
        setActiveRole,
        switchRole,
        activeBranch,
        setActiveBranch,
        branches,
        setBranches,
        login,
        registerPublic,
        registerGaushala,
        logout,
        updateProfile,
        deleteAvatar,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

