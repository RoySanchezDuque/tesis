import { useState, useEffect } from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend 
} from 'recharts';
import { Network, Zap, BarChart as BarChartIcon, Server, CheckCircle2, FileText } from 'lucide-react';
import StatCard from '../../components/StatCard';
import LogsPanel from '../../components/LogsPanel';
import { obtenerFechaFormateada } from '../../utils/dateUtils';

const Dashboard = () => {
  const { 
    trafico, 
    latenciaPromedio, 
    cargaBalanceada, 
    nodos, 
    metricas, 
    eventos 
  } = useSimulation();
  
  const [traficoData, setTraficoData] = useState<any[]>([]);
  const [cargaNodos, setCargaNodos] = useState<any[]>([]);
  
  // Preparar datos para gráficas
  useEffect(() => {
    // Datos para gráfica de tráfico
    const datosTráfico = trafico.map((valor, index) => ({
      minuto: index,
      valor
    }));
    setTraficoData(datosTráfico);
    
    // Datos para gráfica de carga de nodos
    const datosNodos = nodos
      .filter(nodo => nodo.tipo === 'servidor' || nodo.tipo === 'balanceador')
      .map(nodo => ({
        nombre: nodo.nombre,
        carga: nodo.carga,
        estado: nodo.estado
      }));
    setCargaNodos(datosNodos);
  }, [trafico, nodos]);

  // Calcular estadísticas
  const nodosDisponibles = nodos.filter(nodo => nodo.estado !== 'crítico').length;
  const nodosTotal = nodos.length;
  const disponibilidad = (nodosDisponibles / nodosTotal) * 100;
  
  return (
    <div className="space-y-6 pb-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard de Operaciones
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {obtenerFechaFormateada()} | Monitorización y estadísticas del sistema
        </p>
      </header>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Latencia Promedio" 
          value={`${latenciaPromedio.toFixed(1)} ms`} 
          icon={<Zap className="h-8 w-8 text-primary-500" />}
          change={{ value: -2.3, label: 'desde ayer' }}
          trend="down"
          trendPositive={true}
        />
        
        <StatCard 
          title="Tráfico Actual" 
          value={`${trafico[trafico.length - 1]?.toFixed(1) || 0} Mbps`} 
          icon={<BarChartIcon className="h-8 w-8 text-warning-500" />}
          change={{ value: 5.2, label: 'desde ayer' }}
          trend="up"
          trendPositive={false}
        />
        
        <StatCard 
          title="Eficiencia de Balanceo" 
          value={`${cargaBalanceada.toFixed(1)}%`} 
          icon={<Network className="h-8 w-8 text-success-500" />}
          change={{ value: 1.8, label: 'desde ayer' }}
          trend="up"
          trendPositive={true}
        />
        
        <StatCard 
          title="Disponibilidad de Nodos" 
          value={`${disponibilidad.toFixed(1)}%`} 
          icon={<Server className="h-8 w-8 text-primary-500" />}
          change={{ value: 0, label: 'sin cambios' }}
          trend="flat"
          trendPositive={true}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Gráfica de tráfico en tiempo real */}
        <div className="card h-80">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
              <BarChartIcon className="h-5 w-5 mr-2 text-primary-500" />
              Tráfico en Tiempo Real
            </h2>
            <div className="badge badge-info">Actualización en vivo</div>
          </div>
          
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
                  formatter={(value: number) => [`${value.toFixed(1)} Mbps`, 'Tráfico']}
                  labelFormatter={(value) => `Hace ${20 - value} min`}
                />
                <Line 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#0F52BA" 
                  dot={false}
                  strokeWidth={2}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica de carga por nodo */}
        <div className="card h-80">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
              <Server className="h-5 w-5 mr-2 text-primary-500" />
              Carga por Nodo
            </h2>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={cargaNodos}
                margin={{ top: 5, right: 20, bottom: 20, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis 
                  dataKey="nombre" 
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  stroke="#6B7280"
                />
                <YAxis 
                  label={{ value: 'Carga (%)', angle: -90, position: 'insideLeft' }}
                  stroke="#6B7280"
                />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Carga']}
                  labelFormatter={(value) => `Nodo: ${value}`}
                />
                <Bar 
                  dataKey="carga" 
                  name="Carga" 
                  fill="#0F52BA" 
                  radius={[4, 4, 0, 0]}
                  // Color según el estado
                  fill={(data) => data.estado === 'crítico' 
                    ? '#C0392B' 
                    : data.estado === 'advertencia' 
                      ? '#F5B041' 
                      : '#2E8B57'
                  }
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Logs recientes y resumen de eventos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary-500" />
                Eventos Recientes
              </h2>
              <a href="/logs" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                Ver todos
              </a>
            </div>
            <LogsPanel logs={eventos.slice(0, 5)} />
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center mb-4">
            <CheckCircle2 className="h-5 w-5 mr-2 text-success-500" />
            Estado del Sistema
          </h2>
          
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">Algoritmo Activo</span>
                <span className="font-medium capitalize text-primary-600 dark:text-primary-400">
                  Balanceo IA
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-1">
                <div className="bg-primary-500 h-1 rounded-full w-full"></div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">Servidores Disponibles</span>
                <span className="font-medium text-success-600 dark:text-success-400">
                  {nodosDisponibles}/{nodosTotal}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-1">
                <div 
                  className="bg-success-500 h-1 rounded-full" 
                  style={{ width: `${(nodosDisponibles / nodosTotal) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">Uso de Recursos</span>
                <span className="font-medium text-warning-600 dark:text-warning-400">
                  {Math.round(trafico[trafico.length - 1] || 0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-1">
                <div 
                  className="bg-warning-500 h-1 rounded-full" 
                  style={{ width: `${trafico[trafico.length - 1] || 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Próximas Acciones:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>Mantenimiento programado: 23/05/2025</li>
                <li>Actualización de algoritmo IA: 15/06/2025</li>
                <li>Auditoría de seguridad: 30/06/2025</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;