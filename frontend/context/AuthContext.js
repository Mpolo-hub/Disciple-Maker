'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../lib/apiClient';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = window.localStorage.getItem('auth:user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (response?.user) {
        setUser(response.user);
        window.localStorage.setItem('auth:user', JSON.stringify(response.user));
        window.localStorage.setItem('auth:token', response.accessToken);
      }
      return response;
    } catch (error) {
      // Tentative d'enregistrement automatique puis nouvelle connexion
      await apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      return login(email, password);
    }
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem('auth:user');
    window.localStorage.removeItem('auth:token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
