import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, userService } from '../services/api';
import type { User } from '../types';

const defaultUser = {
  id: 'U001',
  name: 'Admin User',
  email: 'admin@hotelonline.co',
  role: 'admin',
  status: 'active',
  department: 'Management',
  lastActive: new Date().toISOString(),
  createdAt: '2023-01-01T00:00:00Z',
  permissions: [
    'view:dashboard',
    'view:hotels',
    'edit:hotels',
    'view:contacts',
    'edit:contacts',
    'view:bookings',
    'edit:bookings',
    'view:guests',
    'edit:guests',
    'view:finance',
    'edit:finance',
    'view:tickets',
    'edit:tickets',
    'manage:users'
  ]
} as const;

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('token');
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => defaultUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeAuth() {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setIsLoading(false);
        return;
      }
      
      try {
        const user = await userService.getCurrentUser();
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setIsAuthenticated(false);
        setCurrentUser(null);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();
  }, [currentUser]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      localStorage.setItem('token', response.token);
      setIsAuthenticated(true);
      const user = await userService.getCurrentUser();
      console.log('User logged in:', user);
      setCurrentUser(user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const hasPermission = (permission: string): boolean => {
    return currentUser?.permissions.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, currentUser, login, logout,
      hasPermission, hasAnyPermission, hasAllPermissions
    }}>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        children
      )}
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