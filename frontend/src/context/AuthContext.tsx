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

export const DEMO_PERSONAS: Record<UserRole, User> = {
  BUYER: {
    id: 'usr_buyer_1',
    email: 'buyer@brightbox.io',
    name: 'Elena Ramos',
    companyName: 'BrightBox Consumer Goods',
    role: 'BUYER',
    walletAddress: '0x1111111111111111111111111111111111111111'
  },
  SUPPLIER: {
    id: 'usr_supplier_1',
    email: 'supplier@packagepro.io',
    name: 'Marcus Chen',
    companyName: 'PackagePro Domestic',
    role: 'SUPPLIER',
    walletAddress: '0x2222222222222222222222222222222222222222'
  },
  PROVIDER: {
    id: 'usr_provider_1',
    email: 'vault@sentinel.fi',
    name: 'Sarah Jenkins',
    companyName: 'Sentinel Protection Vault',
    role: 'PROVIDER',
    walletAddress: '0x4444444444444444444444444444444444444444'
  },
  VERIFIER: {
    id: 'usr_verifier_1',
    email: 'inspector@sgs-verify.org',
    name: 'Dr. David Miller',
    companyName: 'SGS Independent Verifier',
    role: 'VERIFIER',
    walletAddress: '0x3333333333333333333333333333333333333333'
  },
  JUDGE: {
    id: 'usr_judge_1',
    email: 'judge@fintechathon.org',
    name: 'Hackathon Evaluation Committee',
    companyName: 'FinTechathon 2026 Judge',
    role: 'JUDGE',
    walletAddress: '0x8a3C00000000000000000000000000000000Bde6'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [allPersonas, setAllPersonas] = useState<User[]>(Object.values(DEMO_PERSONAS));
  const [loading, setLoading] = useState(true);

  // Fetch available demo personas
  const fetchPersonas = async () => {
    try {
      const res = await fetch('/api/auth/personas');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAllPersonas(data);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch personas from API, using demo personas', err);
    }
  };

  // Check stored auth session
  useEffect(() => {
    const initAuth = async () => {
      // 1. Determine saved or default persona immediately
      const savedPersonaRole = typeof window !== 'undefined' ? (localStorage.getItem('supplyright_persona_role') as UserRole) : null;
      const initialRole: UserRole = savedPersonaRole && DEMO_PERSONAS[savedPersonaRole] ? savedPersonaRole : 'BUYER';
      
      // Seed initial active persona so UI is immediately functional
      setUser(DEMO_PERSONAS[initialRole]);

      await fetchPersonas();
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('supplyright_token') : null;
      if (storedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              setUser(data.user);
              setToken(storedToken);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Auth check failed', err);
        }
      }

      // Try server auto-login to selected persona
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ personaRole: initialRole })
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
        console.warn('Server auto-login failed, operating in offline/demo mode', err);
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
          localStorage.setItem('supplyright_persona_role', data.user.role);
          window.dispatchEvent(new CustomEvent('supplyright_state_updated'));
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const loginAsPersona = async (role: UserRole): Promise<boolean> => {
    // 1. Immediately switch client-side user state so UI responds in 0ms
    const fallbackUser = DEMO_PERSONAS[role];
    if (fallbackUser) {
      setUser(fallbackUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('supplyright_persona_role', role);
        window.dispatchEvent(new CustomEvent('supplyright_state_updated'));
      }
    }

    // 2. Sync with backend API to obtain signed JWT token and update server session
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
          localStorage.setItem('supplyright_persona_role', data.user.role);
          window.dispatchEvent(new CustomEvent('supplyright_state_updated'));
        }
        return true;
      }
      return !!fallbackUser;
    } catch (err) {
      console.warn('Backend login API call failed, kept local persona', err);
      return !!fallbackUser;
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
