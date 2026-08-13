import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginAdmin } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('toxic_admin_token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('toxic_admin_user') || 'null'));

  const login = async (username, password) => {
    const res = await loginAdmin(username, password);
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('toxic_admin_token', res.token);
      localStorage.setItem('toxic_admin_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('toxic_admin_token');
    localStorage.removeItem('toxic_admin_user');
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
