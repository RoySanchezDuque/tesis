import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import TrafficPrediction from './pages/prediction/TrafficPrediction';
import NetworkTopology from './pages/topology/NetworkTopology';
import TrafficSimulator from './pages/simulator/TrafficSimulator';
import LogsEvents from './pages/logs/LogsEvents';
import UserManagement from './pages/users/UserManagement';
import ConfigPanel from './pages/config/ConfigPanel';
import Reports from './pages/reports/Reports';
import NotFound from './pages/NotFound';

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Establece el título de la página según la ruta
  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    let title = 'IA-Balanceo | Optimización de Redes ';
    
    if (pathSegments.length > 0) {
      const lastSegment = pathSegments[pathSegments.length - 1];
      const formattedSegment = lastSegment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      title = `${formattedSegment} | IA-Balanceo`;
    }
    
    document.title = title;
  }, [location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-3 text-primary-600 dark:text-primary-400 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rutas protegidas - requieren autenticación */}
      <Route
        path="/"
        element={user ? <DashboardLayout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Dashboard />} />
        <Route path="prediccion" element={<TrafficPrediction />} />
        <Route path="topologia" element={<NetworkTopology />} />
        <Route path="simulador" element={<TrafficSimulator />} />
        <Route path="logs" element={<LogsEvents />} />
        <Route path="usuarios" element={<UserManagement />} />
        <Route path="configuracion" element={<ConfigPanel />} />
        <Route path="informes" element={<Reports />} />
      </Route>
      
      {/* Rutas públicas */}
      <Route path="/" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
      </Route>
      
      {/* Ruta 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;