import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/api';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminUser: AdminUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const result = await AuthService.login(email, password);
      if (result.success && result.token && result.user) {
        setToken(result.token);
        setAdminUser(result.user);
        setIsAdminAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Authentication failed' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Unable to connect to authentication service' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setAdminUser(null);
    setIsAdminAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminAuthenticated,
        adminUser,
        token,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
