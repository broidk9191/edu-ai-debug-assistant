import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login, register, getCurrentUser, loginWithGoogle } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Verify token and get user info
      getCurrentUser(storedToken)
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const response = await login(email, password);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('token', response.token);
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    const response = await register(email, password, name);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('token', response.token);
  };

  const handleLoginWithGoogle = async (idToken: string) => {
    const response = await loginWithGoogle(idToken);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('token', response.token);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login: handleLogin,
    register: handleRegister,
    loginWithGoogle: handleLoginWithGoogle,
    logout: handleLogout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
