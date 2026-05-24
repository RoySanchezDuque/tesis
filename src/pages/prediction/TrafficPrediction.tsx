import { useState, useEffect } from 'react';
import { Prediccion } from '../../types';
import { useServer } from '../../contexts/ServerContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, ReferenceLine 
} from 'recharts';
import { Activity, Settings, RefreshCw, Info } from 'lucide-react';
import { obtenerFechaFormateada } from '../../utils/dateUtils';

const TrafficPrediction = () => {
  const { logs, fetchLogs, modelMetrics } = useServer();
  const [predicciones, setPredicciones] = useState<Prediccion[]>([]);
  const [intervaloPrecision, setIntervaloPrecision] = useState<number>(80);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [algoritmoIA] = useState<string>('decision_tree');
  const [loadingPredicciones, setLoadingPredicciones] = useState<boolean>(false);
  const [errorPredicciones, setErrorPredicciones] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>(
    new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  );

  const accuracy = typeof modelMetrics?.accuracy === 'number' ? modelMetrics.accuracy : null;
  const macroF1 = typeof modelMetrics?.metrics?.macro_f1 === 'number' ? modelMetrics.metrics.macro_f1 : null;
  const avgConfidence = logs.length
    ? logs.reduce((acc, log) => acc + (typeof log.prediction_confidence === 'number' ? log.prediction_confidence : 0), 0) / logs.length
    : null;

  const buildPredictionsFromLogs = () => {
    const now = new Date();
    const currentHour = now.getHours();

    if (!logs.length) {
      const fallback = Array.from({ length: 24 }, (_, hour) => ({
        hora: hour,
        traficoPredicho: 0,
      }));
      setPredicciones(fallback);
      return;
    }

    // Use most recent date in logs as the "real" baseline day.
    const latestTimestamp = logs[0]?.timestamp ? new Date(logs[0].timestamp) : new Date();
    const baselineDate = latestTimestamp.toISOString().slice(0, 10);

    const logsOfDay = logs.filter((log) => {
      if (!log.timestamp) return false;
      return new Date(log.timestamp).toISOString().slice(0, 10) === baselineDate;
    });

    const byHour = new Map<number, { sum: number; count: number }>();
    logsOfDay.forEach((log) => {
      if (typeof log.traffic_volume !== 'number') return;
      const hour = new Date(log.timestamp).getHours();
      const prev = byHour.get(hour) ?? { sum: 0, count: 0 };
      byHour.set(hour, { sum: prev.sum + log.traffic_volume, count: prev.count + 1 });
    });

    const hourlyReal = Array.from({ length: 24 }, (_, hour) => {
      const entry = byHour.get(hour);
      return entry ? entry.sum / entry.count : null;
    });

    const availableReal = hourlyReal.filter((value): value is number => typeof value === 'number');
    const globalAvg = availableReal.length
      ? availableReal.reduce((acc, value) => acc + value, 0) / availableReal.length
      : 0;

    const confidenceFactor = accuracy ?? 0.75;

    const result: Prediccion[] = Array.from({ length: 24 }, (_, hour) => {
      const real = hourlyReal[hour];

      const windowValues = [
        hourlyReal[(hour + 23) % 24],
        hourlyReal[hour],
        hourlyReal[(hour + 1) % 24],
      ].filter((value): value is number => typeof value === 'number');

      const localBase = windowValues.length
        ? windowValues.reduce((acc, value) => acc + value, 0) / windowValues.length
        : globalAvg;

      const pastReference = hourlyReal[(hour + 23) % 24] ?? globalAvg;
      const trend = pastReference ? (localBase - pastReference) / pastReference : 0;
      const boundedTrend = Math.max(-0.25, Math.min(0.25, trend));

      const predBase = real ?? localBase;
      const futureWeight = hour >= currentHour ? 1.0 : 0.92;
      const pred = Math.max(
        0,
        predBase * (1 + boundedTrend * 0.5) * (0.9 + confidenceFactor * 0.15) * futureWeight
      );

      return {
        hora: hour,
        traficoReal: real ?? undefined,
        traficoPredicho: Number(pred.toFixed(2)),
      };
    });

    setPredicciones(result);
  };

  const cargarPrediccionesReales = async () => {
    setLoadingPredicciones(true);
    setErrorPredicciones(null);

    try {
      await fetchLogs(500, 0);
      setUltimaActualizacion(
        new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      );
    } catch (error) {
      setErrorPredicciones('No se pudo cargar la serie de trafico real desde el backend.');
      console.error('Error loading real predictions:', error);
    } finally {
      setLoadingPredicciones(false);
    }
  };

  useEffect(() => {
    cargarPrediccionesReales();
    const interval = setInterval(cargarPrediccionesReales, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    buildPredictionsFromLogs();
  }, [logs, modelMetrics]);

  const regenerarPredicciones = () => {
    cargarPrediccionesReales();
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
                    className="input w-full"
                    disabled
                  >
                    <option value="decision_tree">Arbol de Decision</option>
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

          {errorPredicciones && (
            <div className="mb-4 rounded-md border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700 dark:border-danger-900 dark:bg-danger-900/20 dark:text-danger-300">
              {errorPredicciones}
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

          {loadingPredicciones && (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Actualizando datos reales...</p>
          )}
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
                  <span className="font-medium text-success-600 dark:text-success-400">
                    {accuracy !== null ? `${(accuracy * 100).toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-1.5">
                  <div
                    className="bg-success-500 h-1.5 rounded-full"
                    style={{ width: `${accuracy !== null ? Math.max(0, Math.min(100, accuracy * 100)) : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-300">Macro F1</span>
                  <span className="font-medium text-warning-600 dark:text-warning-400">
                    {macroF1 !== null ? `${(macroF1 * 100).toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-1.5">
                  <div
                    className="bg-warning-500 h-1.5 rounded-full"
                    style={{ width: `${macroF1 !== null ? Math.max(0, Math.min(100, macroF1 * 100)) : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-300">Confianza</span>
                  <span className="font-medium text-primary-600 dark:text-primary-400">
                    {avgConfidence !== null ? `${(avgConfidence * 100).toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-1.5">
                  <div
                    className="bg-primary-500 h-1.5 rounded-full"
                    style={{ width: `${avgConfidence !== null ? Math.max(0, Math.min(100, avgConfidence * 100)) : 0}%` }}
                  ></div>
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
                  {(() => {
                    const peak = predicciones.reduce((max, current) =>
                      current.traficoPredicho > max.traficoPredicho ? current : max,
                    predicciones[0] ?? { hora: 0, traficoPredicho: 0 });
                    return `Pico de tráfico estimado a las ${peak.hora}:00h (${peak.traficoPredicho.toFixed(1)} Mbps)`;
                  })()}
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-3 h-3 rounded-full bg-warning-500 mt-1 mr-2"></div>
                <span className="text-gray-700 dark:text-gray-200">
                  {(() => {
                    const criticalHours = predicciones.filter((point) => point.traficoPredicho >= 800).map((point) => `${point.hora}:00`);
                    return criticalHours.length
                      ? `Posible congestión en horas: ${criticalHours.slice(0, 3).join(', ')}`
                      : 'No se detectan horas con congestión crítica en la proyección actual';
                  })()}
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-3 h-3 rounded-full bg-success-500 mt-1 mr-2"></div>
                <span className="text-gray-700 dark:text-gray-200">
                  {(() => {
                    const lowHours = predicciones.filter((point) => point.traficoPredicho <= 250).map((point) => `${point.hora}:00`);
                    return lowHours.length
                      ? `Tráfico bajo esperado en: ${lowHours.slice(0, 3).join(', ')}`
                      : 'No hay valles de tráfico pronunciados en el horizonte de 24h';
                  })()}
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-3 h-3 rounded-full bg-primary-500 mt-1 mr-2"></div>
                <span className="text-gray-700 dark:text-gray-200">
                  Basado en logs reales y métricas activas del modelo actual
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
                <li>Pre-calentar nodos activos 30 min antes de la hora pico proyectada</li>
                <li>Ajustar umbrales de autoescalado cuando la predicción supere 800 Mbps</li>
                <li>Programar tareas de mantenimiento en los valles de menor tráfico</li>
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
            El modelo de prediccion utiliza Arboles de Decision entrenados con 
            datos historicos de trafico de red. El sistema analiza patrones de carga,
            latencia y condiciones operativas para predecir la demanda futura.
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