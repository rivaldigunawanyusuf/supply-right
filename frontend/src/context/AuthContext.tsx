'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  activeRole: UserRole;
  allPersonas: User[];
  login: (email: string, password: string) => Promise<boolean>;
  loginAsPersona: (role: UserRole) => Promise<boolean>;
  register: (data: {
    name: string;
    companyName: string;
    email: string;
    password: string;
    role: UserRole;
    walletAddress?: string;
  }) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [allPersonas, setAllPersonas] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch available demo personas
  const fetchPersonas = async () => {
    try {
      const res = await fetch('/api/auth/personas');
      if (res.ok) {
        const data = await res.json();
        setAllPersonas(data);
      }
    } catch (err) {
      console.warn('Failed to fetch personas', err);
    }
  };

  // Check stored auth session
  useEffect(() => {
    const initAuth = async () => {
      await fetchPersonas();
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('supplyright_token') : null;
      if (storedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            setToken(storedToken);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Auth check failed', err);
        }
      }

      // Default auto-login to Buyer persona for authentic B2B SaaS procurement experience
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ personaRole: 'BUYER' })
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(data.token);
          if (typeof window !== 'undefined') {
            localStorage.setItem('supplyright_token', data.token);
          }
        }
      } catch (err) {
        console.warn('Auto-login to buyer persona failed', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('supplyright_token', data.token);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const loginAsPersona = async (role: UserRole): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaRole: role })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('supplyright_token', data.token);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const register = async (data: {
    name: string;
    companyName: string;
    email: string;
    password: string;
    role: UserRole;
    walletAddress?: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const resData = await res.json();
        setUser(resData.user);
        setToken(resData.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('supplyright_token', resData.token);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supplyright_token');
    }
  };

  const activeRole: UserRole = user?.role || 'JUDGE';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        activeRole,
        allPersonas,
        login,
        loginAsPersona,
        register,
        logout,
        loading
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
