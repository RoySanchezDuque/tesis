import { useState } from 'react';
import { useServer } from '../../contexts/ServerContext';
import { Server, Plus, Edit, Trash2, AlertCircle, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { Server as ServerType } from '../../services/api';

const ServerManagement = () => {
  const { servers, createServer, updateServer, deleteServer } = useServer();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedServer, setSelectedServer] = useState<ServerType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '',
    max_capacity: 1000,
    status: 'active' as 'active' | 'inactive' | 'maintenance'
  });

  const handleAddServer = async () => {
    if (!formData.name || !formData.ip_address) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    try {
      await createServer({
        name: formData.name,
        ip_address: formData.ip_address,
        max_capacity: formData.max_capacity,
        status: formData.status,
        current_load: 0
      });
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating server:', error);
    }
  };

  const handleEditServer = async () => {
    if (!selectedServer) return;

    try {
      await updateServer(selectedServer.id, {
        name: formData.name,
        ip_address: formData.ip_address,
        max_capacity: formData.max_capacity,
        status: formData.status
      });
      setShowEditModal(false);
      setSelectedServer(null);
      resetForm();
    } catch (error) {
      console.error('Error updating server:', error);
    }
  };

  const handleDeleteServer = async () => {
    if (!selectedServer) return;

    try {
      await deleteServer(selectedServer.id);
      setShowDeleteModal(false);
      setSelectedServer(null);
    } catch (error) {
      console.error('Error deleting server:', error);
    }
  };

  const startEditServer = (server: ServerType) => {
    setSelectedServer(server);
    setFormData({
      name: server.name,
      ip_address: server.ip_address,
      max_capacity: 1000,
      status: server.status
    });
    setShowEditModal(true);
  };

  const startDeleteServer = (server: ServerType) => {
    setSelectedServer(server);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      ip_address: '',
      max_capacity: 1000,
      status: 'active'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getLoadColor = (load: number) => {
    if (load < 50) return 'text-green-600 dark:text-green-400';
    if (load < 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6 pb-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Servidores
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Administra los servidores del sistema de balanceo de carga
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Servidor
        </button>
      </header>

      {/* Lista de servidores */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
            <thead className="bg-gray-50 dark:bg-dark-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Servidor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Carga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
              {servers.map((server) => (
                <tr key={server.id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Server className="h-5 w-5 text-primary-500 mr-3" />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {server.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {server.ip_address}:{server.port}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(server.status)}`}>
                      {server.status === 'active' ? 'Activo' : server.status === 'inactive' ? 'Inactivo' : 'Mantenimiento'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2 mr-2" style={{ width: '100px' }}>
                        <div 
                          className={`h-2 rounded-full ${server.load_percentage < 50 ? 'bg-green-500' : server.load_percentage < 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${server.load_percentage}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${getLoadColor(server.load_percentage)}`}>
                        {server.load_percentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => startEditServer(server)}
                      className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-4"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => startDeleteServer(server)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Agregar Servidor */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Agregar Nuevo Servidor
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">Nombre del Servidor</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Server-4"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Dirección IP</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="192.168.1.4"
                  value={formData.ip_address}
                  onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Capacidad Máxima</label>
                <input
                  type="number"
                  className="input w-full"
                  placeholder="1000"
                  value={formData.max_capacity}
                  onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="label">Estado</label>
                <select
                  className="input w-full"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="maintenance">Mantenimiento</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="btn btn-secondary">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </button>
              <button onClick={handleAddServer} className="btn btn-primary">
                <Check className="h-4 w-4 mr-2" />
                Crear Servidor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Servidor */}
      {showEditModal && selectedServer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Editar Servidor
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">Nombre del Servidor</label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Dirección IP</label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.ip_address}
                  onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Capacidad Máxima</label>
                <input
                  type="number"
                  className="input w-full"
                  value={formData.max_capacity}
                  onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="label">Estado</label>
                <select
                  className="input w-full"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="maintenance">Mantenimiento</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => { setShowEditModal(false); setSelectedServer(null); resetForm(); }} className="btn btn-secondary">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </button>
              <button onClick={handleEditServer} className="btn btn-primary">
                <Check className="h-4 w-4 mr-2" />
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar Servidor */}
      {showDeleteModal && selectedServer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full mx-4">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Eliminar Servidor
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  ¿Estás seguro de que deseas eliminar el servidor <strong>{selectedServer.name}</strong>? 
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => { setShowDeleteModal(false); setSelectedServer(null); }} className="btn btn-secondary">
                Cancelar
              </button>
              <button onClick={handleDeleteServer} className="btn bg-red-500 hover:bg-red-600 text-white">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerManagement;
