import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Network, 
  LayoutDashboard, 
  Activity, 
  Share2, 
  Sliders, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  ChevronDown,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout, hasPermission } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState('Dashboard');

  // Actualizar título de página según la ruta
  useEffect(() => {
    const pathToTitle: Record<string, string> = {
      '/': 'Dashboard',
      '/prediccion': 'Predicción de Tráfico',
      '/topologia': 'Topología de Red',
      '/simulador': 'Simulador de Tráfico',
      '/logs': 'Logs y Eventos',
      '/usuarios': 'Gestión de Usuarios',
      '/configuracion': 'Configuración',
      '/informes': 'Informes'
    };
    
    setPageTitle(pathToTitle[location.pathname] || 'Dashboard');
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItem = ({ to, icon, label, permission }: { 
    to: string; 
    icon: React.ReactNode; 
    label: string;
    permission?: string;
  }) => {
    // Si se requiere un permiso y el usuario no lo tiene, no mostrar el item
    if (permission && !hasPermission(permission)) {
      return null;
    }
    
    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
            isActive
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
          }`
        }
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <span className="mr-3">{icon}</span>
        {label}
      </NavLink>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
      {/* Sidebar para pantallas grandes */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:h-screen bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700">
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-dark-700">
          <Network className="h-8 w-8 text-primary-500" />
          <span className="ml-2 text-xl font-bold text-primary-600 dark:text-primary-400">IA-Balanceo</span>
        </div>
        
        <div className="overflow-y-auto flex-grow py-4 px-3">
          <nav className="space-y-1">
            <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <NavItem to="/prediccion" icon={<Activity size={18} />} label="Predicción de Tráfico" />
            <NavItem to="/topologia" icon={<Share2 size={18} />} label="Topología de Red" />
            <NavItem to="/simulador" icon={<Sliders size={18} />} label="Simulador de Tráfico" />
            <NavItem to="/logs" icon={<FileText size={18} />} label="Logs y Eventos" />
            <NavItem to="/usuarios" icon={<Users size={18} />} label="Gestión de Usuarios" permission="users" />
            <NavItem to="/configuracion" icon={<Settings size={18} />} label="Configuración" permission="config" />
            <NavItem to="/informes" icon={<FileText size={18} />} label="Informes" permission="reports" />
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-dark-700">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
          >
            {theme === 'light' ? (
              <>
                <Moon size={18} className="mr-3" />
                Modo Oscuro
              </>
            ) : (
              <>
                <Sun size={18} className="mr-3" />
                Modo Claro
              </>
            )}
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={18} className="mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="md:ml-64 flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-dark-800 shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Hamburger menu para móvil */}
            <button
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            {/* Título de la página */}
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">{pageTitle}</h1>
            
            {/* Perfil de usuario */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 focus:outline-none"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <img
                  alt="Perfil"
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {user?.nombre} {user?.apellido}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.rol}
                  </p>
                </div>
                <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
              </button>
              
              {/* Menú desplegable de perfil */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-dark-700">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-dark-700">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {user?.nombre} {user?.apellido}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                  
                  <button
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700"
                    onClick={toggleTheme}
                  >
                    {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
                  </button>
                  
                  <button
                    className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={handleLogout}
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-gray-900/50 z-20">
            <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-dark-800 shadow-lg overflow-y-auto">
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-dark-700">
                <div className="flex items-center">
                  <Network className="h-7 w-7 text-primary-500" />
                  <span className="ml-2 text-lg font-bold text-primary-600 dark:text-primary-400">
                    IA-Balanceo
                  </span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>
              
              <nav className="p-4 space-y-1">
                <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
                <NavItem to="/prediccion" icon={<Activity size={18} />} label="Predicción de Tráfico" />
                <NavItem to="/topologia" icon={<Share2 size={18} />} label="Topología de Red" />
                <NavItem to="/simulador" icon={<Sliders size={18} />} label="Simulador de Tráfico" />
                <NavItem to="/logs" icon={<FileText size={18} />} label="Logs y Eventos" />
                <NavItem to="/usuarios" icon={<Users size={18} />} label="Gestión de Usuarios" permission="users" />
                <NavItem to="/configuracion" icon={<Settings size={18} />} label="Configuración" permission="config" />
                <NavItem to="/informes" icon={<FileText size={18} />} label="Informes" permission="reports" />
              </nav>
              
              <div className="p-4 border-t border-gray-200 dark:border-dark-700">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                >
                  {theme === 'light' ? (
                    <>
                      <Moon size={18} className="mr-3" />
                      Modo Oscuro
                    </>
                  ) : (
                    <>
                      <Sun size={18} className="mr-3" />
                      Modo Claro
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full mt-2 flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={18} className="mr-3" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-dark-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;