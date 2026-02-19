'use client';

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void | { requiresTwoFactor: true; tempToken: string }>;
  verifyTwoFactor: (tempToken: string, otp: string) => Promise<void>;
  register: (email: string, password: string, name: string, confirmPassword?: string) => Promise<{ requiresVerification?: boolean; emailSent?: boolean } | void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setUser(json.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Login failed');
      if (data.data?.requiresTwoFactor && data.data?.tempToken) {
        return { requiresTwoFactor: true as const, tempToken: data.data.tempToken };
      }
      await refreshUser();
    },
    [refreshUser]
  );

  const verifyTwoFactor = useCallback(
    async (tempToken: string, otp: string) => {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, otp }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Verification failed');
      await refreshUser();
    },
    [refreshUser]
  );

  const register = useCallback(
    async (email: string, password: string, name: string, confirmPassword?: string) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          confirmPassword: confirmPassword ?? password,
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Registration failed');
      if (data.data?.requiresVerification) {
        return { requiresVerification: true, emailSent: data.data.emailSent };
      }
      await refreshUser();
    },
    [refreshUser]
  );

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    login,
    verifyTwoFactor,
    register,
    logout,
    refreshUser,
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
