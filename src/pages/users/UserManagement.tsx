import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usuarios } from '../../data/mockData';
import { User, ChevronDown, UserPlus, Edit, Trash, Search, AlertCircle } from 'lucide-react';
import { Usuario } from '../../types';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const { user: currentUser, hasPermission } = useAuth();
  const [users, setUsers] = useState<Usuario[]>(usuarios);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [newUser, setNewUser] = useState<Partial<Usuario>>({
    username: '',
    nombre: '',
    apellido: '',
    email: '',
    rol: 'invitado',
  });
  
  // Filtrar usuarios según término de búsqueda
  const filteredUsers = users.filter(u => 
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Verificar si el usuario tiene permisos de administrador
  const canManageUsers = hasPermission('users');
  
  // Agregar usuario
  const handleAddUser = () => {
    if (!newUser.username || !newUser.nombre || !newUser.email) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }
    
    const id = Math.max(...users.map(u => u.id)) + 1;
    const userToAdd = {
      ...newUser,
      id
    } as Usuario;
    
    setUsers([...users, userToAdd]);
    setShowAddModal(false);
    setNewUser({
      username: '',
      nombre: '',
      apellido: '',
      email: '',
      rol: 'invitado',
    });
    
    toast.success(`Usuario ${userToAdd.nombre} añadido correctamente`);
  };
  
  // Editar usuario
  const handleEditUser = () => {
    if (!selectedUser) return;
    
    const updatedUsers = users.map(u => 
      u.id === selectedUser.id ? selectedUser : u
    );
    
    setUsers(updatedUsers);
    setShowEditModal(false);
    setSelectedUser(null);
    
    toast.success(`Usuario ${selectedUser.nombre} actualizado correctamente`);
  };
  
  // Eliminar usuario
  const handleDeleteUser = () => {
    if (!selectedUser) return;
    
    const updatedUsers = users.filter(u => u.id !== selectedUser.id);
    setUsers(updatedUsers);
    setShowDeleteModal(false);
    setSelectedUser(null);
    
    toast.success(`Usuario eliminado correctamente`);
  };
  
  // Preparar edición de usuario
  const startEditUser = (user: Usuario) => {
    setSelectedUser({...user});
    setShowEditModal(true);
  };
  
  // Preparar eliminación de usuario
  const startDeleteUser = (user: Usuario) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };
  
  // Obtener color para el rol
  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case 'admin':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-100';
      case 'ingeniero':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-dark-700 dark:text-gray-100';
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Gestión de Usuarios
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Administración de cuentas y permisos de usuario
        </p>
      </header>

      {!canManageUsers ? (
        <div className="card p-6 text-center">
          <AlertCircle className="h-12 w-12 text-warning-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Acceso Restringido
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            No tienes permisos suficientes para gestionar usuarios.
            Por favor, contacta con un administrador.
          </p>
        </div>
      ) : (
        <>
          {/* Barra de herramientas */}
          <div className="card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="w-full md:w-1/3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10 w-full"
                    placeholder="Buscar usuarios..."
                  />
                </div>
              </div>
              
              <button 
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Añadir Usuario
              </button>
            </div>
          </div>

          {/* Tabla de usuarios */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
                <thead className="bg-gray-50 dark:bg-dark-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rol
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img 
                              className="h-10 w-10 rounded-full" 
                              src={user.avatar} 
                              alt={`${user.nombre} ${user.apellido}`} 
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.nombre} {user.apellido}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.rol)}`}>
                          {user.rol.charAt(0).toUpperCase() + user.rol.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => startEditUser(user)}
                            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                            disabled={user.id === currentUser?.id}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => startDeleteUser(user)}
                            className="text-danger-600 hover:text-danger-800 dark:text-danger-400 dark:hover:text-danger-300"
                            disabled={user.id === currentUser?.id}
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-10">
                <User className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                <p className="text-gray-600 dark:text-gray-300">No se encontraron usuarios</p>
              </div>
            )}
          </div>

          {/* Modal de añadir usuario */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Añadir Nuevo Usuario
                    </h3>
                    <button 
                      onClick={() => setShowAddModal(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Nombre</label>
                        <input 
                          type="text" 
                          className="input w-full" 
                          value={newUser.nombre}
                          onChange={(e) => setNewUser({...newUser, nombre: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="label">Apellido</label>
                        <input 
                          type="text" 
                          className="input w-full" 
                          value={newUser.apellido}
                          onChange={(e) => setNewUser({...newUser, apellido: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="label">Nombre de usuario</label>
                      <input 
                        type="text" 
                        className="input w-full" 
                        value={newUser.username}
                        onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="label">Email</label>
                      <input 
                        type="email" 
                        className="input w-full" 
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="label">Rol</label>
                      <select 
                        className="input w-full" 
                        value={newUser.rol}
                        onChange={(e) => setNewUser({
                          ...newUser, 
                          rol: e.target.value as 'admin' | 'ingeniero' | 'invitado'
                        })}
                      >
                        <option value="admin">Administrador</option>
                        <option value="ingeniero">Ingeniero</option>
                        <option value="invitado">Invitado</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button 
                      onClick={() => setShowAddModal(false)}
                      className="btn btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleAddUser}
                      className="btn btn-primary"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal de editar usuario */}
          {showEditModal && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Editar Usuario
                    </h3>
                    <button 
                      onClick={() => setShowEditModal(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Nombre</label>
                        <input 
                          type="text" 
                          className="input w-full" 
                          value={selectedUser.nombre}
                          onChange={(e) => setSelectedUser({...selectedUser, nombre: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="label">Apellido</label>
                        <input 
                          type="text" 
                          className="input w-full" 
                          value={selectedUser.apellido}
                          onChange={(e) => setSelectedUser({...selectedUser, apellido: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="label">Email</label>
                      <input 
                        type="email" 
                        className="input w-full" 
                        value={selectedUser.email}
                        onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="label">Rol</label>
                      <select 
                        className="input w-full" 
                        value={selectedUser.rol}
                        onChange={(e) => setSelectedUser({
                          ...selectedUser, 
                          rol: e.target.value as 'admin' | 'ingeniero' | 'invitado'
                        })}
                      >
                        <option value="admin">Administrador</option>
                        <option value="ingeniero">Ingeniero</option>
                        <option value="invitado">Invitado</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button 
                      onClick={() => setShowEditModal(false)}
                      className="btn btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleEditUser}
                      className="btn btn-primary"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal de eliminar usuario */}
          {showDeleteModal && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Confirmar Eliminación
                    </h3>
                    <button 
                      onClick={() => setShowDeleteModal(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-danger-500 mx-auto mb-4" />
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      ¿Estás seguro de que deseas eliminar al usuario <span className="font-medium">{selectedUser.nombre} {selectedUser.apellido}</span>?
                      Esta acción no se puede deshacer.
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button 
                      onClick={() => setShowDeleteModal(false)}
                      className="btn btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleDeleteUser}
                      className="btn btn-danger"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserManagement;