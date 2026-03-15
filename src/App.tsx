import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import LoadingScreen   from './pages/LoadingScreen';
import Home            from './pages/Home';
import Unauthorized    from './pages/Unauthorized';
import DashboardLayout from './layout/DashboardLayout';
import Dashboard       from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* Entry point — validates handshake token then redirects */}
          <Route path="/"              element={<LoadingScreen />} />

          {/* Public landing */}
          <Route path="/home"          element={<Home />} />

          {/* Auth failure */}
          <Route path="/unauthorized"  element={<Unauthorized />} />

          {/* Protected dashboard shell */}
          <Route path="/dashboard"     element={<DashboardLayout />}>
            <Route index               element={<Dashboard />} />
            {/* Future nested routes: map, activity, alerts, stats, models, settings … */}
          </Route>

          {/* Fallback */}
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
