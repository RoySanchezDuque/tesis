import { Outlet } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Network } from 'lucide-react';

const AuthLayout = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
      {/* Header con logo y tema */}
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Network className="h-8 w-8 text-primary-500" />
          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">IA-Balanceo</span>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
          aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
        >
          {theme === 'light' ? 
            <Moon className="h-5 w-5 text-gray-700" /> : 
            <Sun className="h-5 w-5 text-gray-200" />
          }
        </button>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      
      <footer className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        © 2025 Proyecto Académico: Balanceo de Carga con IA para Redes de Telecomunicaciones - ROY SANCHEZ DUQUE
      </footer>
    </div>
  );
};

export default AuthLayout;