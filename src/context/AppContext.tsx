import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AppContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  setUser: (user: AppUser | null) => void;
  setIsAuthenticated: (v: boolean) => void;
  setIsAuthLoading: (v: boolean) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        isAuthLoading,
        setUser,
        setIsAuthenticated,
        setIsAuthLoading,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};

export default AppContext;
