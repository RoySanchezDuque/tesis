import { useState, useEffect } from 'react';
import { useServer } from '../../contexts/ServerContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar
} from 'recharts';
import { Network, Zap, BarChart as BarChartIcon, Server, CheckCircle2, FileText } from 'lucide-react';
import StatCard from '../../components/StatCard';
import LogsPanel from '../../components/LogsPanel';
import { obtenerFechaFormateada } from '../../utils/dateUtils';

const Dashboard = () => {
  const { servers, logs, fetchServers, fetchLogs, loading } = useServer();
  
  const [traficoData, setTraficoData] = useState<any[]>([]);
  const [cargaNodos, setCargaNodos] = useState<any[]>([]);
  
  useEffect(() => {
    fetchServers();
    const interval = setInterval(fetchServers, 1000); // Actualizar cada segundo para gráfica más fluida
    return () => clearInterval(interval);
  }, [fetchServers]);

  useEffect(() => {
    fetchLogs(100, 0);
  }, [fetchLogs]);
  
  useEffect(() => {
    if (servers.length > 0) {
      const timestamp = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const avgLoad = servers.reduce((acc, s) => acc + s.load_percentage, 0) / servers.length;
      
      setTraficoData(prev => {
        const next = [...prev, { time: timestamp, carga: avgLoad }];
        return next.slice(-20);
      });
    }

    const datosNodos = servers.map(servidor => ({
      nombre: servidor.name,
      carga: servidor.load_percentage,
      estado: servidor.status === 'active' ? 'normal' : servidor.status
    }));
    setCargaNodos(datosNodos);
  }, [servers]);

  const nodosDisponibles = servers.filter(s => s.status === 'active').length;
  const nodosTotal = servers.length;
  const disponibilidad = nodosTotal > 0 ? (nodosDisponibles / nodosTotal) * 100 : 0;
  
  const avgLoad = servers.length > 0
    ? servers.reduce((acc, s) => acc + s.load_percentage, 0) / servers.length
    : 0;
  
  const balanceStd = servers.length > 0
    ? Math.sqrt(
        servers.reduce((acc, s) => acc + Math.pow(s.load_percentage - avgLoad, 2), 0) / servers.length
      )
    : 0;
  const eficienciaBalanceo = Math.max(0, Math.min(100, 100 - balanceStd));
  
  const latenciaPromedio = servers.length > 0 
    ? servers.reduce((acc, s) => {
        const baseLatency = 10;
        const loadFactor = s.load_percentage / 100;
        const latency = baseLatency + (loadFactor * 50);
        return acc + latency;
      }, 0) / servers.length
    : 0;
  
  const eventosRecientesNormalizados = logs.slice(0, 5).map((log: any, idx: number) => ({
    id: log.id ?? idx,
    timestamp: log.created_at ? obtenerFechaFormateada(log.created_at) : new Date().toISOString(),
    tipo: 'log',
    mensaje: log.action || log.details || 'Evento del servidor',
    nodoId: log.server_id || null,
    severidad: 'info' as const,
  }));
  
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
          title="Carga Promedio" 
          value={`${avgLoad.toFixed(1)}%`} 
          icon={<BarChartIcon className="h-8 w-8 text-warning-500" />}
          change={{ value: 5.2, label: 'desde ayer' }}
          trend="up"
          trendPositive={false}
        />
        
        <StatCard 
          title="Eficiencia de Balanceo" 
          value={`${eficienciaBalanceo.toFixed(1)}%`} 
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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
                  dataKey="time" 
                  label={{ value: 'Tiempo', position: 'insideBottomRight', offset: -10 }}
                  stroke="#6B7280"
                  tick={{ fontSize: 9 }}
                />
                <YAxis 
                  label={{ value: 'Carga (%)', angle: -90, position: 'insideLeft' }}
                  stroke="#6B7280"
                  domain={[0, 100]}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Carga']}
                />
                <Line 
                  type="monotone" 
                  dataKey="carga" 
                  stroke="#0F52BA" 
                  dot={false}
                  strokeWidth={2}
                  activeDot={{ r: 5 }}
                  name="Carga del Sistema"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

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
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center mb-4">
              <FileText className="h-5 w-5 mr-2 text-primary-500" />
              Eventos Recientes
            </h2>
            <LogsPanel logs={eventosRecientesNormalizados} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Estado General</h3>
            
            <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">Disponibilidad</span>
                <span className="font-medium text-success-600 dark:text-success-400">
                  {disponibilidad.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                <div 
                  className="bg-success-500 h-2 rounded-full" 
                  style={{ width: `${disponibilidad}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">Uso de Recursos</span>
                <span className="font-medium text-warning-600 dark:text-warning-400">
                  {avgLoad.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                <div 
                  className="bg-warning-500 h-2 rounded-full" 
                  style={{ width: `${avgLoad}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">Eficiencia Balanceo</span>
                <span className="font-medium text-primary-600 dark:text-primary-400">
                  {eficienciaBalanceo.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full" 
                  style={{ width: `${eficienciaBalanceo}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Servidores</h3>
            <div className="space-y-2">
              {servers.slice(0, 5).map((server) => (
                <div 
                  key={server.id} 
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-dark-700 rounded"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">{server.name}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    server.status === 'active' 
                      ? 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-200'
                      : 'bg-danger-100 dark:bg-danger-900 text-danger-700 dark:text-danger-200'
                  }`}>
                    {server.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;