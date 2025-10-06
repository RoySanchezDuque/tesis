import { useState, useEffect } from 'react';
import { generarPrediccion } from '../../data/mockData';
import { Prediccion } from '../../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, ReferenceLine 
} from 'recharts';
import { Activity, Settings, RefreshCw, Info } from 'lucide-react';
import { obtenerFechaFormateada } from '../../utils/dateUtils';

const TrafficPrediction = () => {
  const [predicciones, setPredicciones] = useState<Prediccion[]>([]);
  const [intervaloPrecision, setIntervaloPrecision] = useState<number>(80);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [algoritmoIA, setAlgoritmoIA] = useState<string>('neuronal');
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>(
    new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  );

  // Cargar predicciones al montar el componente
  useEffect(() => {
    const datos = generarPrediccion();
    setPredicciones(datos);
  }, []);

  // Regenerar predicciones
  const regenerarPredicciones = () => {
    const datos = generarPrediccion();
    setPredicciones(datos);
    setUltimaActualizacion(
      new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    );
  };

  // Formatear hora para el eje X
  const formatearHora = (hora: number) => {
    return `${hora}:00`;
  };

  // Personalizar el tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-dark-800 p-3 border border-gray-200 dark:border-dark-700 rounded-md shadow-md">
          <p className="font-medium text-gray-800 dark:text-white">{`${label}:00h`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(1)} Mbps`}
            </p>
          ))}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {payload[0].payload.traficoReal !== undefined 
              ? 'Datos históricos disponibles' 
              : 'Predicción'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Predicción de Tráfico
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {obtenerFechaFormateada()} | Análisis predictivo de carga de red
        </p>
      </header>

      {/* Panel de control y estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 card">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-primary-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Predicción de Tráfico para las Próximas 24 Horas
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Última actualización: {ultimaActualizacion}
              </span>
              <button 
                onClick={regenerarPredicciones}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                title="Actualizar predicción"
              >
                <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                title="Configuración del modelo"
              >
                <Settings className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Configuración del modelo (expandible) */}
          {showSettings && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600 slide-in">
              <h3 className="font-medium text-gray-800 dark:text-white mb-3">
                Configuración del Modelo Predictivo
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Algoritmo de IA</label>
                  <select 
                    value={algoritmoIA}
                    onChange={(e) => setAlgoritmoIA(e.target.value)}
                    className="input w-full"
                  >
                    <option value="neuronal">Red Neuronal Recurrente (RNN)</option>
                    <option value="lstm">LSTM</option>
                    <option value="gru">GRU</option>
                    <option value="transformer">Transformer</option>
                    <option value="arima">ARIMA + IA</option>
                  </select>
                </div>
                
                <div>
                  <label className="label">
                    Intervalo de Precisión: {intervaloPrecision}%
                  </label>
                  <input 
                    type="range"
                    min="50"
                    max="95"
                    value={intervaloPrecision}
                    onChange={(e) => setIntervaloPrecision(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-dark-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <div className="flex items-start p-3 bg-primary-50 dark:bg-primary-900/20 rounded-md">
                    <Info className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-primary-700 dark:text-primary-300">
                      Ajustar estos parámetros modifica el comportamiento del modelo predictivo. 
                      Un mayor intervalo de precisión reduce los falsos positivos pero puede 
                      aumentar los falsos negativos.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button 
                  onClick={() => {
                    regenerarPredicciones();
                    setShowSettings(false);
                  }}
                  className="btn btn-primary"
                >
                  Aplicar Cambios
                </button>
              </div>
            </div>
          )}

          {/* Gráfico de predicción */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={predicciones}
                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis 
                  dataKey="hora" 
                  tickFormatter={formatearHora}
                  stroke="#6B7280"
                  tickMargin={10}
                />
                <YAxis 
                  label={{ 
                    value: 'Tráfico (Mbps)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fill: '#6B7280' }
                  }}
                  stroke="#6B7280"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  formatter={(value) => <span className="text-sm">{value}</span>}
                />
                
                {/* Línea para tráfico real (datos pasados) */}
                <Line
                  type="monotone"
                  dataKey="traficoReal"
                  name="Tráfico Real"
                  stroke="#2E8B57"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                
                {/* Línea para tráfico predicho */}
                <Line
                  type="monotone"
                  dataKey="traficoPredicho"
                  name="Tráfico Predicho"
                  stroke="#0F52BA"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
                
                {/* Línea de referencia para la hora actual */}
                <ReferenceLine
                  x={new Date().getHours()}
                  stroke="#F5B041"
                  strokeWidth={2}
                  label={{
                    value: 'Ahora',
                    position: 'top',
                    fill: '#F5B041',
                    fontSize: 12
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Panel lateral con métricas e información */}
        <div className="space-y-4">
          {/* Métricas de precisión */}
          <div className="card">
            <h3 className="font-medium text-gray-800 dark:text-white mb-3">
              Métricas del Modelo
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-300">Precisión</span>
                  <span className="font-medium text-success-600 dark:text-success-400">93.7%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-1.5">
                  <div className="bg-success-500 h-1.5 rounded-full" style={{ width: '93.7%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-300">RMSE</span>
                  <span className="font-medium text-warning-600 dark:text-warning-400">4.2 Mbps</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-1.5">
                  <div className="bg-warning-500 h-1.5 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-300">Confianza</span>
                  <span className="font-medium text-primary-600 dark:text-primary-400">87.5%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-1.5">
                  <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: '87.5%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Patrones detectados */}
          <div className="card">
            <h3 className="font-medium text-gray-800 dark:text-white mb-3">
              Patrones Detectados
            </h3>
            
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <div className="w-3 h-3 rounded-full bg-primary-500 mt-1 mr-2"></div>
                <span className="text-gray-700 dark:text-gray-200">
                  Pico de tráfico previsto entre 12:00-14:00h
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-3 h-3 rounded-full bg-warning-500 mt-1 mr-2"></div>
                <span className="text-gray-700 dark:text-gray-200">
                  Posible congestión en nodos centrales hacia las 17:00h
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-3 h-3 rounded-full bg-success-500 mt-1 mr-2"></div>
                <span className="text-gray-700 dark:text-gray-200">
                  Tráfico bajo esperado entre 01:00-05:00h
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-3 h-3 rounded-full bg-primary-500 mt-1 mr-2"></div>
                <span className="text-gray-700 dark:text-gray-200">
                  Incremento gradual desde 07:00h
                </span>
              </li>
            </ul>
          </div>
          
          {/* Acciones recomendadas */}
          <div className="card">
            <h3 className="font-medium text-gray-800 dark:text-white mb-3">
              Acciones Recomendadas
            </h3>
            
            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-md text-sm text-primary-700 dark:text-primary-300">
              <p className="font-medium mb-2">Recomendaciones del sistema:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Optimizar balanceo en nodos 3, 5 y 7 antes de pico</li>
                <li>Activar servidor de respaldo durante hora punta</li>
                <li>Programar mantenimiento para período de bajo tráfico</li>
              </ul>
            </div>
            
            <div className="mt-4">
              <button className="btn btn-primary w-full">
                Aplicar Recomendaciones
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="card mt-6">
        <h3 className="font-medium text-gray-800 dark:text-white mb-3">
          Acerca del Modelo Predictivo
        </h3>
        
        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
          <p>
            El modelo de predicción utiliza redes neuronales recurrentes (RNN) entrenadas con 
            datos históricos de tráfico de red. El sistema analiza patrones temporales, 
            estacionalidad y correlaciones para predecir la carga futura.
          </p>
          <p>
            Factores considerados en la predicción:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Patrones históricos de tráfico por hora/día/semana</li>
            <li>Eventos programados y temporadas de alta demanda</li>
            <li>Estado actual de la infraestructura de red</li>
            <li>Tendencias de crecimiento de tráfico</li>
          </ul>
          <p className="mt-2">
            La precisión del modelo se evalúa continuamente comparando las predicciones con 
            los datos reales recopilados, lo que permite un refinamiento constante.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrafficPrediction;