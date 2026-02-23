import { useState } from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import { useServer } from '../../contexts/ServerContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, BarChart, Bar 
} from 'recharts';
import { Sliders, Play, SkipForward, PauseCircle, Router, Activity, BarChart2, FileText, Send } from 'lucide-react';
import { obtenerFechaFormateada } from '../../utils/dateUtils';
import LogsPanel from '../../components/LogsPanel';

const TrafficSimulator = () => {
  const { 
    trafico, 
    latenciaPromedio, 
    cargaBalanceada, 
    nodos, 
    eventos,
    algoritmoActual,
    modoAutomatico, 
    tipoSimulacion, 
    cargaSimulacion, 
    frecuenciaActualizacion,
    setAlgoritmoActual,
    setModoAutomatico,
    setTipoSimulacion,
    setCargaSimulacion,
    setFrecuenciaActualizacion,
    ejecutarBalanceo,
    resetearSimulacion
  } = useSimulation();
  
  const { sendTraffic, servers } = useServer();
  
  const [showComparison, setShowComparison] = useState<boolean>(false);
  
  // Función para enviar tráfico al backend
  const handleSendTraffic = async () => {
    // Generar métricas aleatorias según el formato esperado por el backend
    const trafficData = {
      traffic_volume: parseFloat((Math.random() * 1000).toFixed(2)),
      network_latency: parseFloat((Math.random() * 200).toFixed(2)),
      throughput: parseFloat((Math.random() * 100).toFixed(2)),
      packet_loss: parseFloat((Math.random() * 5).toFixed(2)),
      signal_strength: parseFloat((Math.random() * 100).toFixed(2)),
      resource_allocation: parseFloat((Math.random() * 100).toFixed(2)),
      handover_success: parseFloat((Math.random() * 100).toFixed(2))
    };
    
    console.log('Sending traffic data:', trafficData);
    await sendTraffic(trafficData);
  };
  
  // Datos para la comparación de algoritmos
  const comparisonData = [
    { 
      name: 'Latencia', 
      IA: 42, 
      RoundRobin: 67, 
      LeastConnections: 58 
    },
    { 
      name: 'Eficiencia', 
      IA: 87, 
      RoundRobin: 65, 
      LeastConnections: 72 
    },
    { 
      name: 'Distribución', 
      IA: 92, 
      RoundRobin: 75, 
      LeastConnections: 81 
    },
    { 
      name: 'Adaptabilidad', 
      IA: 95, 
      RoundRobin: 50, 
      LeastConnections: 68 
    },
  ];
  
  // Datos para el gráfico de tráfico
  const traficoData = trafico.map((valor, index) => ({
    minuto: index,
    valor
  }));
  
  // Formatear tooltip del gráfico
  const formatTooltip = (value: number) => {
    return `${value} Mbps`;
  };

  return (
    <div className="space-y-6 pb-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Simulador de Tráfico
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {obtenerFechaFormateada()} | Simulación y análisis de balanceo de carga
        </p>
      </header>

      {/* Panel de control */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <Sliders className="h-5 w-5 mr-2 text-primary-500" />
            Panel de Control
          </h2>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleSendTraffic}
              className="btn btn-success"
              title="Enviar tráfico al backend"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Tráfico
            </button>
            
            <button 
              onClick={ejecutarBalanceo}
              className="btn btn-primary"
              title="Ejecutar balanceo de carga manualmente"
            >
              <Activity className="h-4 w-4 mr-2" />
              Balancear
            </button>
            
            <button 
              onClick={resetearSimulacion}
              className="btn btn-secondary"
              title="Reiniciar simulación"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Reiniciar
            </button>
          </div>
        </div>
        
        {/* Controles de simulación */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tipo de Tráfico */}
          <div>
            <label className="label">Tipo de Tráfico</label>
            <div className="grid grid-cols-3 gap-2">
              <button 
                className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  tipoSimulacion === 'normal' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-700 dark:text-gray-300 dark:hover:bg-dark-600'
                }`}
                onClick={() => setTipoSimulacion('normal')}
              >
                Normal
              </button>
              <button 
                className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  tipoSimulacion === 'pico' 
                    ? 'bg-warning-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-700 dark:text-gray-300 dark:hover:bg-dark-600'
                }`}
                onClick={() => setTipoSimulacion('pico')}
              >
                Pico
              </button>
              <button 
                className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  tipoSimulacion === 'fallo' 
                    ? 'bg-danger-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-700 dark:text-gray-300 dark:hover:bg-dark-600'
                }`}
                onClick={() => setTipoSimulacion('fallo')}
              >
                Fallo
              </button>
            </div>
          </div>
          
          {/* Algoritmo */}
          <div>
            <label className="label">Algoritmo de Balanceo</label>
            <div className="grid grid-cols-3 gap-2">
              <button 
                className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  algoritmoActual === 'ia' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-700 dark:text-gray-300 dark:hover:bg-dark-600'
                }`}
                onClick={() => setAlgoritmoActual('ia')}
              >
                IA
              </button>
              <button 
                className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  algoritmoActual === 'roundrobin' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-700 dark:text-gray-300 dark:hover:bg-dark-600'
                }`}
                onClick={() => setAlgoritmoActual('roundrobin')}
              >
                Round Robin
              </button>
              <button 
                className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  algoritmoActual === 'leastconnections' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-700 dark:text-gray-300 dark:hover:bg-dark-600'
                }`}
                onClick={() => setAlgoritmoActual('leastconnections')}
              >
                Least Conn.
              </button>
            </div>
          </div>
          
          {/* Modo */}
          <div>
            <label className="label">Modo de Simulación</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  modoAutomatico 
                    ? 'bg-success-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-700 dark:text-gray-300 dark:hover:bg-dark-600'
                }`}
                onClick={() => setModoAutomatico(true)}
              >
                <Play className="h-4 w-4 inline mr-1" />
                Automático
              </button>
              <button 
                className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  !modoAutomatico 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-700 dark:text-gray-300 dark:hover:bg-dark-600'
                }`}
                onClick={() => setModoAutomatico(false)}
              >
                <PauseCircle className="h-4 w-4 inline mr-1" />
                Manual
              </button>
            </div>
          </div>
          
          {/* Nivel de Carga */}
          <div>
            <label className="label">Nivel de Carga: {cargaSimulacion}%</label>
            <input 
              type="range"
              min="10"
              max="100"
              value={cargaSimulacion}
              onChange={(e) => setCargaSimulacion(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-dark-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Bajo</span>
              <span>Medio</span>
              <span>Alto</span>
            </div>
          </div>
          
          {/* Frecuencia de Actualización */}
          <div>
            <label className="label">Frecuencia de Actualización: {frecuenciaActualizacion}s</label>
            <input 
              type="range"
              min="1"
              max="10"
              value={frecuenciaActualizacion}
              onChange={(e) => setFrecuenciaActualizacion(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-dark-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Rápido</span>
              <span>Normal</span>
              <span>Lento</span>
            </div>
          </div>
          
          {/* Comparar Algoritmos */}
          <div className="flex items-end">
            <button 
              onClick={() => setShowComparison(!showComparison)}
              className="btn btn-secondary w-full"
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              {showComparison ? 'Ocultar Comparación' : 'Comparar Algoritmos'}
            </button>
          </div>
        </div>
      </div>

      {/* Visualización de datos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfica de tráfico en tiempo real */}
        <div className="lg:col-span-2 card h-80">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <Router className="h-5 w-5 mr-2 text-primary-500" />
            Tráfico en Tiempo Real
          </h2>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={traficoData}
                margin={{ top: 5, right: 20, bottom: 20, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis 
                  dataKey="minuto" 
                  label={{ value: 'Tiempo (min)', position: 'insideBottomRight', offset: -10 }}
                  stroke="#6B7280"
                />
                <YAxis 
                  label={{ value: 'Mbps', angle: -90, position: 'insideLeft' }}
                  stroke="#6B7280"
                />
                <Tooltip 
                  formatter={formatTooltip}
                  labelFormatter={(value) => `Hace ${20 - value} min`}
                />
                <Line 
                  type="monotone" 
                  dataKey="valor" 
                  name="Tráfico"
                  stroke="#0F52BA" 
                  dot={false}
                  strokeWidth={2}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Métricas de rendimiento */}
        <div className="card flex flex-col h-80">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-primary-500" />
            Métricas de Rendimiento
          </h2>
          
          <div className="space-y-6 flex-grow">
            {/* Latencia */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">Latencia Promedio</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {latenciaPromedio.toFixed(1)} ms
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    latenciaPromedio > 80 
                      ? 'bg-danger-500' 
                      : latenciaPromedio > 50 
                        ? 'bg-warning-500' 
                        : 'bg-success-500'
                  }`}
                  style={{ width: `${Math.min(100, latenciaPromedio / 2)}%` }}
                ></div>
              </div>
            </div>
            
            {/* Carga Balanceada */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">Eficiencia de Balanceo</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {cargaBalanceada.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    cargaBalanceada > 70 
                      ? 'bg-success-500' 
                      : cargaBalanceada > 40 
                        ? 'bg-warning-500' 
                        : 'bg-danger-500'
                  }`}
                  style={{ width: `${cargaBalanceada}%` }}
                ></div>
              </div>
            </div>
            
            {/* Disponibilidad */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">Disponibilidad de Nodos</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {nodos.filter(n => n.estado !== 'crítico').length}/{nodos.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-primary-500"
                  style={{ width: `${(nodos.filter(n => n.estado !== 'crítico').length / nodos.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 bg-gray-50 dark:bg-dark-700 p-3 rounded-md">
            <h3 className="font-medium text-gray-800 dark:text-white text-sm mb-1">
              Estado del Sistema
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {tipoSimulacion === 'normal' 
                ? 'Tráfico estable, balanceo óptimo' 
                : tipoSimulacion === 'pico' 
                  ? 'Alta demanda, sistema compensando' 
                  : 'Recuperación post-fallo en progreso'}
            </p>
          </div>
        </div>
      </div>

      {/* Comparación de algoritmos (condicional) */}
      {showComparison && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <BarChart2 className="h-5 w-5 mr-2 text-primary-500" />
            Comparación de Algoritmos de Balanceo
          </h2>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="IA" fill="#0F52BA" name="IA" />
                <Bar dataKey="RoundRobin" fill="#F5B041" name="Round Robin" />
                <Bar dataKey="LeastConnections" fill="#2E8B57" name="Least Connections" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-md">
              <h3 className="font-medium text-primary-700 dark:text-primary-300 mb-1">Algoritmo IA</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Adapta la distribución de tráfico en tiempo real basándose en aprendizaje de patrones.
                Mejor rendimiento en escenarios complejos y variables.
              </p>
            </div>
            
            <div className="p-3 bg-warning-50 dark:bg-warning-900/20 rounded-md">
              <h3 className="font-medium text-warning-700 dark:text-warning-300 mb-1">Round Robin</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Distribuye secuencialmente las solicitudes entre todos los servidores.
                Simple pero menos eficiente con cargas variables.
              </p>
            </div>
            
            <div className="p-3 bg-success-50 dark:bg-success-900/20 rounded-md">
              <h3 className="font-medium text-success-700 dark:text-success-300 mb-1">Least Connections</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Enruta tráfico al servidor con menos conexiones activas.
                Mejor que Round Robin pero sin capacidad predictiva.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Eventos del sistema */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary-500" />
            Eventos de Simulación
          </h2>
          <a href="/logs" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
            Ver todos
          </a>
        </div>
        
        <LogsPanel logs={eventos.slice(0, 5)} />
      </div>
    </div>
  );
};

export default TrafficSimulator;