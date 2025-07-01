'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  changePassword: (oldPassword: string, newPassword: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const checkAuth = () => {
      // Only run on client side
      if (typeof window !== 'undefined') {
        try {
          const authStatus = localStorage.getItem('isAuthenticated');
          const userData = localStorage.getItem('user');

          if (authStatus === 'true' && userData) {
            const parsedUser = JSON.parse(userData);
            // Ensure user has all required fields for backward compatibility
            const fullUser = {
              username: parsedUser.username || 'admin',
              firstName: parsedUser.firstName || 'Admin',
              lastName: parsedUser.lastName || 'User',
              email: parsedUser.email || 'admin@zentask.local',
              role: parsedUser.role || 'admin',
            };
            setUser(fullUser);
            // Update localStorage with complete user data
            localStorage.setItem('user', JSON.stringify(fullUser));
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('user');
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Redirect logic
    if (!isLoading) {
      if (!isAuthenticated && pathname !== '/login') {
        router.push('/login');
      } else if (isAuthenticated && pathname === '/login') {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = (username: string, password: string): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      // Check stored password or default
      const storedPassword = localStorage.getItem('userPassword') || 'admin123';

      if (username === 'admin' && password === storedPassword) {
        const userData = {
          username: 'admin',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@zentask.local',
          role: 'admin',
        };
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
    return false;
  };

  const updateUser = (userData: Partial<User>): void => {
    if (user && typeof window !== 'undefined') {
      try {
        const updatedUser = { ...user, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } catch (error) {
        console.error('Error updating user:', error);
      }
    }
  };

  const changePassword = (
    oldPassword: string,
    newPassword: string
  ): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      const storedPassword = localStorage.getItem('userPassword') || 'admin123';

      if (oldPassword === storedPassword) {
        localStorage.setItem('userPassword', newPassword);
        return true;
      }
    } catch (error) {
      console.error('Error changing password:', error);
    }
    return false;
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        updateUser,
        changePassword,
        isLoading,
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
