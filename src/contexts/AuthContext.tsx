import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, userService } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing token and validate
    const token = localStorage.getItem('access_token');
    if (token) {
      userService.getCurrentUser().then(setUser);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { access_token } = await auth.login(email, password);
    if (access_token) {
      const user = await userService.getCurrentUser();
      setUser(user);
    }
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      login,
      logout
    }}>
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