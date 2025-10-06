import { useState, useEffect } from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import { EventoLog } from '../../types';
import { FileText, Filter, Download, Search, AlertCircle, CheckCircle, AlertTriangle, Info, RefreshCcw } from 'lucide-react';
import { formatearFechaHora } from '../../utils/dateUtils';
import LogsPanel from '../../components/LogsPanel';

const LogsEvents = () => {
  const { eventos } = useSimulation();
  const [filteredLogs, setFilteredLogs] = useState<EventoLog[]>(eventos);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<string>('all');
  const [availableNodes, setAvailableNodes] = useState<number[]>([]);
  
  // Inicializar nodos disponibles para filtrar
  useEffect(() => {
    const nodes = eventos
      .filter(e => e.nodoId !== null)
      .map(e => e.nodoId as number);
    setAvailableNodes([...new Set(nodes)]);
  }, [eventos]);
  
  // Aplicar filtros cuando cambian
  useEffect(() => {
    let results = [...eventos];
    
    // Filtro por término de búsqueda
    if (searchTerm) {
      results = results.filter(log => 
        log.mensaje.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtro por severidad
    if (selectedSeverity !== 'all') {
      results = results.filter(log => log.severidad === selectedSeverity);
    }
    
    // Filtro por tipo
    if (selectedType !== 'all') {
      results = results.filter(log => log.tipo === selectedType);
    }
    
    // Filtro por nodo
    if (selectedNode !== 'all') {
      results = results.filter(log => log.nodoId === parseInt(selectedNode));
    }
    
    setFilteredLogs(results);
  }, [eventos, searchTerm, selectedSeverity, selectedType, selectedNode]);
  
  // Exportar logs en formato CSV
  const exportCSV = () => {
    // Encabezados CSV
    let csv = 'ID,Fecha,Hora,Tipo,Mensaje,Nodo ID,Severidad\n';
    
    // Añadir filas
    filteredLogs.forEach(log => {
      const date = new Date(log.timestamp);
      const dateStr = date.toLocaleDateString('es-ES');
      const timeStr = date.toLocaleTimeString('es-ES');
      
      csv += `${log.id},${dateStr},${timeStr},${log.tipo},"${log.mensaje}",${log.nodoId || ''},${log.severidad}\n`;
    });
    
    // Crear y descargar el archivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Logs y Eventos
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Registro histórico de eventos del sistema
        </p>
      </header>

      {/* Panel de filtros */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <Filter className="h-5 w-5 mr-2 text-primary-500" />
            Filtros
          </h2>
          
          <button 
            onClick={exportCSV}
            className="btn btn-secondary flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <label htmlFor="search" className="label">Buscar</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
                placeholder="Buscar en mensajes..."
              />
            </div>
          </div>
          
          {/* Filtro por Severidad */}
          <div>
            <label htmlFor="severity" className="label">Severidad</label>
            <select
              id="severity"
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="input w-full"
            >
              <option value="all">Todas</option>
              <option value="info">Información</option>
              <option value="warning">Advertencia</option>
              <option value="error">Error</option>
            </select>
          </div>
          
          {/* Filtro por Tipo */}
          <div>
            <label htmlFor="type" className="label">Tipo</label>
            <select
              id="type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input w-full"
            >
              <option value="all">Todos</option>
              <option value="balanceo">Balanceo</option>
              <option value="sistema">Sistema</option>
              <option value="error">Error</option>
              <option value="alerta">Alerta</option>
              <option value="usuario">Usuario</option>
            </select>
          </div>
          
          {/* Filtro por Nodo */}
          <div>
            <label htmlFor="node" className="label">Nodo</label>
            <select
              id="node"
              value={selectedNode}
              onChange={(e) => setSelectedNode(e.target.value)}
              className="input w-full"
            >
              <option value="all">Todos</option>
              {availableNodes.map(nodeId => (
                <option key={nodeId} value={nodeId}>
                  ID: {nodeId}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center">
          <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/30 mr-4">
            <FileText className="h-6 w-6 text-primary-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total de Eventos</p>
            <p className="text-xl font-semibold text-gray-800 dark:text-white">{eventos.length}</p>
          </div>
        </div>
        
        <div className="card p-4 flex items-center">
          <div className="p-3 rounded-full bg-danger-100 dark:bg-danger-900/30 mr-4">
            <AlertCircle className="h-6 w-6 text-danger-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Errores</p>
            <p className="text-xl font-semibold text-gray-800 dark:text-white">
              {eventos.filter(e => e.severidad === 'error').length}
            </p>
          </div>
        </div>
        
        <div className="card p-4 flex items-center">
          <div className="p-3 rounded-full bg-warning-100 dark:bg-warning-900/30 mr-4">
            <AlertTriangle className="h-6 w-6 text-warning-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Advertencias</p>
            <p className="text-xl font-semibold text-gray-800 dark:text-white">
              {eventos.filter(e => e.severidad === 'warning').length}
            </p>
          </div>
        </div>
        
        <div className="card p-4 flex items-center">
          <div className="p-3 rounded-full bg-success-100 dark:bg-success-900/30 mr-4">
            <RefreshCcw className="h-6 w-6 text-success-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Operaciones de Balanceo</p>
            <p className="text-xl font-semibold text-gray-800 dark:text-white">
              {eventos.filter(e => e.tipo === 'balanceo').length}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de logs */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary-500" />
            Registro de Eventos
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {filteredLogs.length} de {eventos.length} eventos
          </span>
        </div>
        
        {filteredLogs.length > 0 ? (
          <div className="space-y-2">
            <LogsPanel logs={filteredLogs} />
            
            {/* Paginación simple */}
            <div className="flex justify-center mt-6">
              <button className="btn btn-secondary">
                Cargar Más Eventos
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-success-500" />
            <p className="text-gray-600 dark:text-gray-300">No se encontraron eventos con los filtros seleccionados</p>
          </div>
        )}
      </div>

      {/* Guía de severidad */}
      <div className="card p-4">
        <h3 className="font-medium text-gray-800 dark:text-white mb-3">
          Guía de Severidad
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start">
            <div className="p-1.5 rounded-full bg-success-100 dark:bg-success-900/30 mr-2">
              <Info className="h-4 w-4 text-success-500" />
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Información</p>
              <p className="text-gray-600 dark:text-gray-300">
                Eventos normales del sistema sin impacto en el servicio.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="p-1.5 rounded-full bg-warning-100 dark:bg-warning-900/30 mr-2">
              <AlertTriangle className="h-4 w-4 text-warning-500" />
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Advertencia</p>
              <p className="text-gray-600 dark:text-gray-300">
                Situaciones que requieren atención pero no afectan el servicio.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="p-1.5 rounded-full bg-danger-100 dark:bg-danger-900/30 mr-2">
              <AlertCircle className="h-4 w-4 text-danger-500" />
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Error</p>
              <p className="text-gray-600 dark:text-gray-300">
                Problemas críticos que afectan el funcionamiento del sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogsEvents;