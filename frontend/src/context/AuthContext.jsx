import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/apiService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [theme,   setTheme]   = useState(() => localStorage.getItem('pq_theme') || 'light');
  const [loading, setLoading] = useState(true);
  const [token,   setToken]   = useState(() => localStorage.getItem('pq_token') || null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('pq_theme', theme);
  }, [theme]);

  // Restore session on mount
  useEffect(() => {
    const saved = localStorage.getItem('pq_user');
    const tok   = localStorage.getItem('pq_token');
    if (saved && tok) {
      setUser(JSON.parse(saved));
      setToken(tok);
      api.defaults.headers.common['Authorization'] = `Bearer ${tok}`;
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData, tok) => {
    setUser(userData);
    setToken(tok);
    localStorage.setItem('pq_user',  JSON.stringify(userData));
    localStorage.setItem('pq_token', tok);
    api.defaults.headers.common['Authorization'] = `Bearer ${tok}`;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pq_user');
    localStorage.removeItem('pq_token');
    delete api.defaults.headers.common['Authorization'];
  }, []);

  const toggleTheme = useCallback(() =>
    setTheme(t => t === 'light' ? 'dark' : 'light'), []);

  const updateUser = useCallback((updates) => {
    setUser(u => {
      const updated = { ...u, ...updates };
      localStorage.setItem('pq_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, toggleTheme, updateUser, theme, loading, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
