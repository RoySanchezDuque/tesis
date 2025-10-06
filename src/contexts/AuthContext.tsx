import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usuarios } from '../data/mockData';

export interface User {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'admin' | 'ingeniero' | 'invitado';
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  loginAsGuest: () => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Verifica si hay un usuario guardado al cargar la página
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Función de login
  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulamos una petición al servidor con un delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Buscar usuario en nuestros datos simulados
      const foundUser = usuarios.find(u => u.username === username);
      
      if (foundUser && password === 'password') { // En una app real, verificaríamos hash
        setUser(foundUser);
        localStorage.setItem('user', JSON.stringify(foundUser));
        setLoading(false);
        return true;
      } else {
        setError('Credenciales inválidas');
        setLoading(false);
        return false;
      }
    } catch (err) {
      setError('Error de conexión');
      setLoading(false);
      return false;
    }
  };

  // Función de login como invitado
  const loginAsGuest = () => {
    setLoading(true);
    
    const guestUser: User = {
      id: 999,
      username: 'invitado',
      nombre: 'Usuario',
      apellido: 'Invitado',
      email: 'invitado@example.com',
      rol: 'invitado',
      avatar: 'https://via.placeholder.com/150'
    };
    
    setUser(guestUser);
    localStorage.setItem('user', JSON.stringify(guestUser));
    setLoading(false);
  };

  // Función de logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Función para verificar permisos según el rol
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Definición de permisos por rol
    const permissions = {
      admin: ['read', 'write', 'delete', 'config', 'users', 'reports'],
      ingeniero: ['read', 'write', 'config', 'reports'],
      invitado: ['read']
    };
    
    return permissions[user.rol].includes(permission);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      loginAsGuest, 
      logout, 
      hasPermission 
    }}>
      {children}
    </AuthContext.Provider>
  );
};