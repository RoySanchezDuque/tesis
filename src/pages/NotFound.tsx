import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { HomeIcon, Network } from 'lucide-react';

const NotFound = () => {
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
      <div className="text-center px-4">
        <Network className="h-24 w-24 text-primary-500 mx-auto mb-6" />
        
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Página no encontrada</h2>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-8">
          La página que estás buscando no existe o ha sido movida a otra ubicación.
        </p>
        
        <Link 
          to="/"
          className="inline-flex items-center px-5 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <HomeIcon className="mr-2 h-5 w-5" />
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;