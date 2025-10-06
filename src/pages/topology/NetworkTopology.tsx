import { useState, useEffect, useRef } from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import { Nodo } from '../../types';
import { Share2, Server, Router, Activity, PlusSquare, MinusSquare, RotateCw } from 'lucide-react';
import { obtenerFechaFormateada } from '../../utils/dateUtils';

const NetworkTopology = () => {
  const { nodos, ejecutarBalanceo, simularFallo } = useSimulation();
  const [selectedNode, setSelectedNode] = useState<Nodo | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

  // Obtener colores según estado del nodo
  const getNodeColor = (estado: string): string => {
    switch (estado) {
      case 'crítico':
        return 'bg-danger-500 dark:bg-danger-600';
      case 'advertencia':
        return 'bg-warning-500 dark:bg-warning-600';
      default:
        return 'bg-success-500 dark:bg-success-600';
    }
  };

  // Obtener icono según tipo de nodo
  const getNodeIcon = (tipo: string) => {
    switch (tipo) {
      case 'router':
        return <Router className="h-6 w-6 text-white" />;
      case 'balanceador':
        return <Activity className="h-6 w-6 text-white" />;
      case 'switch':
        return <Share2 className="h-6 w-6 text-white" />;
      default:
        return <Server className="h-6 w-6 text-white" />;
    }
  };

  // Manejar inicio de arrastre
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === canvasRef.current) {
      setIsDragging(true);
      setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  // Manejar movimiento durante arrastre
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y
      });
    }
  };

  // Manejar fin de arrastre
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Manejar zoom
  const handleZoom = (direction: 'in' | 'out') => {
    setZoom(prev => {
      if (direction === 'in' && prev < 1.5) return prev + 0.1;
      if (direction === 'out' && prev > 0.5) return prev - 0.1;
      return prev;
    });
  };

  // Restablecer vista
  const resetView = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mostrar detalles del nodo al hacer clic
  const handleNodeClick = (nodo: Nodo) => {
    setSelectedNode(nodo === selectedNode ? null : nodo);
  };

  // Simular fallo en nodo seleccionado
  const handleSimulateFail = () => {
    if (selectedNode) {
      simularFallo(selectedNode.id);
      setSelectedNode(null);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Topología de Red
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {obtenerFechaFormateada()} | Visualización de infraestructura de red
        </p>
      </header>

      {/* Controles de visualización */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <div className="card py-2 px-3 flex items-center space-x-3">
          <button
            onClick={() => handleZoom('in')}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
            title="Acercar"
          >
            <PlusSquare className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => handleZoom('out')}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
            title="Alejar"
          >
            <MinusSquare className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
            title="Restablecer vista"
          >
            <RotateCw className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="flex-grow"></div>

        <button 
          onClick={ejecutarBalanceo}
          className="btn btn-primary"
        >
          Balancear Carga
        </button>
      </div>

      {/* Contenedor principal - Canvas de topología y panel de detalles */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas de visualización de topología */}
        <div 
          className="lg:col-span-3 card h-[600px] overflow-hidden relative"
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {/* Capa de visualización con transformación */}
          <div 
            className="absolute w-full h-full"
            style={{ 
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
          >
            {/* Conexiones entre nodos */}
            <svg className="absolute w-full h-full z-0 pointer-events-none">
              {nodos.map(nodo => 
                nodo.conexiones.map(conexionId => {
                  const nodoDestino = nodos.find(n => n.id === conexionId);
                  if (!nodoDestino) return null;
                  
                  // Determinar grosor y color de línea según carga
                  const cargaPromedio = (nodo.carga + nodoDestino.carga) / 2;
                  let strokeColor = '#2E8B57'; // verde por defecto
                  let strokeWidth = 1;
                  
                  if (cargaPromedio > 70) {
                    strokeColor = '#C0392B'; // rojo para alta carga
                    strokeWidth = 3;
                  } else if (cargaPromedio > 40) {
                    strokeColor = '#F5B041'; // amarillo para carga media
                    strokeWidth = 2;
                  }
                  
                  return (
                    <line 
                      key={`${nodo.id}-${conexionId}`}
                      x1={nodo.coordenadas.x}
                      y1={nodo.coordenadas.y}
                      x2={nodoDestino.coordenadas.x}
                      y2={nodoDestino.coordenadas.y}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={nodo.estado === 'crítico' || nodoDestino.estado === 'crítico' ? '5,5' : ''}
                      opacity={0.7}
                    />
                  );
                })
              )}
            </svg>
            
            {/* Nodos de red */}
            {nodos.map(nodo => (
              <div
                key={nodo.id}
                className={`absolute rounded-lg shadow-lg flex flex-col items-center transform transition-all cursor-pointer
                ${selectedNode?.id === nodo.id ? 'ring-2 ring-primary-500 ring-offset-2 scale-110' : ''}
                ${nodo.estado === 'crítico' ? 'opacity-50' : ''}`}
                style={{
                  left: `${nodo.coordenadas.x - 40}px`,
                  top: `${nodo.coordenadas.y - 40}px`,
                  width: '80px',
                  zIndex: selectedNode?.id === nodo.id ? 10 : 1
                }}
                onClick={() => handleNodeClick(nodo)}
              >
                <div className={`w-16 h-16 ${getNodeColor(nodo.estado)} rounded-full flex items-center justify-center mb-2`}>
                  {getNodeIcon(nodo.tipo)}
                </div>
                <div className="text-center w-24">
                  <p className="text-xs font-medium text-gray-800 dark:text-white truncate">
                    {nodo.nombre}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {nodo.ip}
                  </p>
                  <div className="mt-1 bg-gray-200 dark:bg-dark-600 rounded-full h-1 w-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        nodo.carga > 80 
                          ? 'bg-danger-500' 
                          : nodo.carga > 60 
                            ? 'bg-warning-500' 
                            : 'bg-success-500'
                      }`}
                      style={{ width: `${nodo.carga}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Información de navegación */}
          <div className="absolute bottom-3 left-3 text-xs text-gray-500 dark:text-gray-400">
            Arrastra para mover. Usa los controles para acercar/alejar.
          </div>
        </div>

        {/* Panel de detalles del nodo */}
        <div className="card">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Detalles del Nodo
                </h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedNode.estado === 'crítico' 
                    ? 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-100' 
                    : selectedNode.estado === 'advertencia'
                      ? 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-100' 
                      : 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-100'
                }`}>
                  {selectedNode.estado.charAt(0).toUpperCase() + selectedNode.estado.slice(1)}
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <div className={`w-20 h-20 ${getNodeColor(selectedNode.estado)} rounded-full flex items-center justify-center`}>
                  {getNodeIcon(selectedNode.tipo)}
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nombre</p>
                  <p className="font-medium text-gray-800 dark:text-white">{selectedNode.nombre}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Dirección IP</p>
                  <p className="font-medium text-gray-800 dark:text-white">{selectedNode.ip}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tipo</p>
                  <p className="font-medium text-gray-800 dark:text-white capitalize">{selectedNode.tipo}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Carga Actual</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 dark:bg-dark-600 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full ${
                          selectedNode.carga > 80 
                            ? 'bg-danger-500' 
                            : selectedNode.carga > 60 
                              ? 'bg-warning-500' 
                              : 'bg-success-500'
                        }`}
                        style={{ width: `${selectedNode.carga}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      {selectedNode.carga}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Conexiones</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNode.conexiones.map(id => {
                      const nodoConectado = nodos.find(n => n.id === id);
                      return (
                        <span 
                          key={id}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-dark-700 rounded"
                          title={nodoConectado?.nombre || `Nodo ID ${id}`}
                        >
                          ID:{id}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 space-y-2">
                <button 
                  onClick={handleSimulateFail}
                  className="btn btn-danger w-full"
                >
                  Simular Fallo
                </button>
                
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="btn btn-secondary w-full"
                >
                  Cerrar Detalles
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Share2 className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                Información de Nodo
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Selecciona un nodo en el diagrama para ver sus detalles
              </p>
              
              <div className="mt-6 p-3 bg-gray-50 dark:bg-dark-700 rounded-md text-sm">
                <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Leyenda:</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-success-500"></div>
                    <span className="text-gray-600 dark:text-gray-300">Normal (0-60%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-warning-500"></div>
                    <span className="text-gray-600 dark:text-gray-300">Advertencia (61-80%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-danger-500"></div>
                    <span className="text-gray-600 dark:text-gray-300">Crítico (81-100%)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkTopology;