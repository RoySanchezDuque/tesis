import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Network, User, Key, LogIn, Info } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const { login, loginAsGuest, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await login(username, password);
    if (success) {
      navigate('/');
    }
    
    setIsLoading(false);
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white dark:bg-dark-800 shadow-lg rounded-lg overflow-hidden">
      {/* Cabecera */}
      <div className="p-6 bg-primary-500 text-white">
        <div className="flex items-center justify-center space-x-3">
          <Network className="h-10 w-10" />
          <div>
            <h1 className="text-2xl font-bold">IA-Balanceo</h1>
            <p className="text-primary-100 text-sm">Optimización de Redes de Telecomunicaciones</p>
          </div>
        </div>
      </div>
      
      {/* Formulario */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white text-center mb-6">
          Iniciar Sesión
        </h2>

        {error && (
          <div className="bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="username" className="label">
            Nombre de usuario
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input pl-10 block w-full"
              placeholder="Ingrese su usuario"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="password" className="label">
            Contraseña
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-10 block w-full"
              placeholder="Ingrese su contraseña"
              required
            />
          </div>
        </div>
        
        {/* Botones */}
        <div className="flex flex-col space-y-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary flex items-center justify-center"
          >
            {isLoading ? (
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : (
              <LogIn className="h-4 w-4 mr-2" />
            )}
            Iniciar Sesión
          </button>
          
          <button
            type="button"
            onClick={handleGuestLogin}
            className="btn btn-secondary"
          >
            Ver como Invitado
          </button>
          
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center justify-center mt-2"
          >
            <Info className="h-4 w-4 mr-1" />
            {showHint ? 'Ocultar ayuda' : 'Mostrar ayuda'}
          </button>
        </div>
      </form>

      {/* Panel de ayuda */}
      {showHint && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-dark-700 text-sm text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-dark-600">
          <p className="font-medium text-primary-600 dark:text-primary-400 mb-2">Credenciales de prueba:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="font-medium">Admin:</span> usuario <code className="text-xs bg-gray-200 dark:bg-dark-600 px-1 rounded">admin</code>, contraseña <code className="text-xs bg-gray-200 dark:bg-dark-600 px-1 rounded">password</code></li>
            <li><span className="font-medium">Ingeniero:</span> usuario <code className="text-xs bg-gray-200 dark:bg-dark-600 px-1 rounded">ingeniero</code>, contraseña <code className="text-xs bg-gray-200 dark:bg-dark-600 px-1 rounded">password</code></li>
            <li><span className="font-medium">Invitado:</span> usuario <code className="text-xs bg-gray-200 dark:bg-dark-600 px-1 rounded">invitado</code>, contraseña <code className="text-xs bg-gray-200 dark:bg-dark-600 px-1 rounded">password</code></li>
          </ul>
          <p className="mt-2">También puedes acceder directamente como invitado con el botón "Ver como Invitado".</p>
        </div>
      )}
    </div>
  );
};

export default Login;