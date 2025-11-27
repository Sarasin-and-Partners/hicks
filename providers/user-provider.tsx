'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/lib/types';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'conduct-log-current-user';

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // Convert date strings back to Date objects
        setUserState({
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          updatedAt: new Date(parsed.updatedAt),
        });
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  const clearUser = () => {
    setUserState(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  return (
    <UserContext.Provider value={{ user, setUser, isLoading, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Helper hook to check if user has specific role
export function useHasRole(allowedRoles: User['role'][]) {
  const { user } = useUser();
  return user ? allowedRoles.includes(user.role) : false;
}

// Helper hook to check if user can access feature
export function useCanAccess(feature: string) {
  const { user } = useUser();

  if (!user) return false;

  const rolePermissions: Record<string, string[]> = {
    employee: ['incidents:create', 'incidents:read:own', 'comments:create'],
    hod: [
      'incidents:create',
      'incidents:read:department',
      'incidents:update',
      'incidents:status:change',
      'comments:create',
      'comments:create:private',
      'analytics:read',
    ],
    risk_office: [
      'incidents:create',
      'incidents:read:all',
      'incidents:reopen',
      'comments:create',
      'comments:create:private',
      'analytics:read',
      'audit:read',
    ],
    admin: [
      'incidents:create',
      'incidents:read:all',
      'incidents:update',
      'comments:create',
      'analytics:read',
      'audit:read',
      'admin:incident-types',
      'admin:teams',
      'admin:processes',
      'admin:users',
    ],
  };

  return rolePermissions[user.role]?.includes(feature) ?? false;
}
