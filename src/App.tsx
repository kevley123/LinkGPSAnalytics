import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import LoadingScreen   from './pages/LoadingScreen';
import Home            from './pages/Home';
import Unauthorized    from './pages/Unauthorized';
import AuthGuard       from './layout/AuthGuard';
import DashboardLayout from './layout/DashboardLayout';
import Dashboard       from './pages/Dashboard';
import Notifications   from './pages/Notifications';
import { useHandshakeAuth } from './hooks/useHandshakeAuth';

const AuthContainer = ({ children }: { children: React.ReactNode }) => {
  useHandshakeAuth();
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AuthContainer>
          <Routes>
          {/* Entry point — validates handshake token then redirects */}
          <Route path="/"              element={<LoadingScreen />} />

          {/* Auth failure (public) */}
          <Route path="/unauthorized"  element={<Unauthorized />} />

          {/* Public landing (but requires session optionally handled in Home) */}
          <Route path="/home"          element={<Home />} />

          {/* Protected Routes */}
          <Route element={<AuthGuard />}>
            {/* Protected dashboard shell */}
            <Route path="/dashboard"     element={<DashboardLayout />}>
              <Route index               element={<Dashboard />} />
              <Route path="notifications" element={<Notifications />} />
              {/* Future nested routes */}
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Routes>
        </AuthContainer>
      </AppProvider>
    </BrowserRouter>
  );
}
