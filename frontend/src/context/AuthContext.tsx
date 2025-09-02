import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    if (response.status === 200) {
      await checkAuth();
    }
  };

  const register = async (name: string, email: string, password: string) => {
    await authAPI.register({ name, email, password });
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  const verifyOtp = async (email: string, otp: string) => {
    await authAPI.verifyOtp({ email, otp });
    await checkAuth();
  };

  const forgotPassword = async (email: string) => {
    await authAPI.forgotPassword({ email });
  };

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    await authAPI.resetPassword({ email, otp, newPassword });
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    verifyOtp,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};