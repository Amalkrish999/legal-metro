import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  officerId: string;
  name: string;
  role: string;
  scope: string;
  state?: string;
  district?: string;
  zone?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('authUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
    setIsInitializing(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    sessionStorage.setItem('authUser', JSON.stringify(userData));
    // Also keeping the old userRole in localStorage for legacy compatibility during transition if needed
    localStorage.setItem('userRole', userData.role);
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('authUser');
    localStorage.removeItem('userRole');
  };

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
