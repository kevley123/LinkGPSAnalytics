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
import MapaVivo        from './pages/MapaVivo';
import ActividadMapa   from './pages/ActividadMapa';
import AlertasIA       from './pages/AlertasIa';
import AlertasVehiculares from './pages/AlertasVehiculares';
import ModeloIA        from './pages/ModeloIa';
import Estadisticas    from './pages/Estadisticas';
import Logistica       from './pages/Logistica';
import MapaAnomalia    from './pages/MapaAnomalia';
import RutasFrecuentes from './pages/RutasFrecuentes';
import MiDispositivo   from './pages/MiDispositivo';
import MiDispositivoStatus from './pages/MiDispositivoStatus';
import MiDispositivoEventos from './pages/MiDispositivoEventos';
import Geocercas       from './pages/Geocercas';
import GeocercasEventos from './pages/GeocercasEventos';
import Configuracion   from './pages/Configuracion';
import OSM               from './pages/OSM';

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
              <Route path="mapa_vivo"        element={<MapaVivo />} />
              <Route path="actividad_mapa"   element={<ActividadMapa />} />
              <Route path="alertas_ia"       element={<AlertasIA />} />
              <Route path="alertas_vehiculares" element={<AlertasVehiculares />} />
              <Route path="modelo_ia"        element={<ModeloIA />} />
              <Route path="estadisticas"    element={<Estadisticas />} />
              <Route path="logistica"       element={<Logistica />} />
              <Route path="mapa_anomalia"    element={<MapaAnomalia />} />
              <Route path="rutas_frecuentes" element={<RutasFrecuentes />} />
              <Route path="mi_dispositivo"   element={<MiDispositivo />} />
              <Route path="mi_dispositivo_status" element={<MiDispositivoStatus />} />
              <Route path="mi_dispositivo_eventos" element={<MiDispositivoEventos />} />
              <Route path="gecercas"       element={<Geocercas />} />
              <Route path="geocercas_eventos" element={<GeocercasEventos />} />
              <Route path="configuracion"   element={<Configuracion />} />
              <Route path="osm"            element={<OSM />} />
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
