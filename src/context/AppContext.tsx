import { createContext, useContext, useState, type ReactNode } from 'react';


export interface AppUser {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  email_verified_at: string | null;
  utype: string;
  fcm_token: string | null;
  created_at: string;
  updated_at: string;
}

interface AppContextType {
  user: AppUser | null;
  authToken: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  notifsCount: number;
  alertsCount: number;
  setUser: (user: AppUser | null) => void;
  setAuthToken: (token: string | null) => void;
  setIsAuthenticated: (v: boolean) => void;
  setIsAuthLoading: (v: boolean) => void;
  setNotifsCount: (v: number) => void;
  setAlertsCount: (v: number) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!authToken);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [notifsCount, setNotifsCount] = useState(0);
  const [alertsCount, setAlertsCount] = useState(0);

  const logout = () => {
    localStorage.removeItem('auth_token');
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        authToken,
        isAuthenticated,
        isAuthLoading,
        notifsCount,
        alertsCount,
        setUser,
        setAuthToken,
        setIsAuthenticated,
        setIsAuthLoading,
        setNotifsCount,
        setAlertsCount,
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
