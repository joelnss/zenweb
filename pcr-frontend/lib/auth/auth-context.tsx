'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserByEmail } from '@/lib/data/users';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'customer' | 'tech';
  username?: string;
  phone?: string;
  company?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('pcr_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check for default admin account
    if (email === 'admin@admin.com' && password === 'admin') {
      const user: User = {
        id: '1',
        email: 'admin@admin.com',
        name: 'Admin',
        role: 'admin',
        username: 'admin',
      };
      setUser(user);
      localStorage.setItem('pcr_user', JSON.stringify(user));
      return true;
    }

    // Check registered users database
    const userAccount = getUserByEmail(email);
    if (userAccount && userAccount.password === password) {
      const user: User = {
        id: userAccount.id,
        email: userAccount.email,
        name: userAccount.name,
        role: userAccount.role,
        phone: userAccount.phone,
        company: userAccount.company,
      };
      setUser(user);
      localStorage.setItem('pcr_user', JSON.stringify(user));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pcr_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
