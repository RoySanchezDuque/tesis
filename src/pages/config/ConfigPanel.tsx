import { useEffect, useState } from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useServer } from '../../contexts/ServerContext';
import { Settings, Save, AlertCircle, Lock, Moon, Sun, RefreshCw, Activity, Brain, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'react-toastify';

type BackendSettings = {
  algorithm: 'ia' | 'roundrobin' | 'leastconnections';
  automatic_mode: boolean;
  update_frequency_sec: number;
  notifications_enabled: boolean;
  warning_threshold: number;
  critical_threshold: number;
  retention_days: number;
  api_endpoint: string;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ConfigPanel = () => {
  const { hasPermission } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { trainModel, modelMetrics } = useServer();
  const { 
    algoritmoActual, 
    modoAutomatico, 
    frecuenciaActualizacion,
    setAlgoritmoActual,
    setModoAutomatico,
    setFrecuenciaActualizacion,
    resetearSimulacion
  } = useSimulation();
  
  // Configuración adicional (simulada)
  const [notificacionesActivas, setNotificacionesActivas] = useState<boolean>(true);
  const [umbralAlerta, setUmbralAlerta] = useState<number>(60);
  const [umbralCritico, setUmbralCritico] = useState<number>(80);
  const [retentionDays, setRetentionDays] = useState<number>(30);
  const [apiEndpoint, setApiEndpoint] = useState<string>("https://api.balanceo-ia.edu/v1");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState<boolean>(false);
  
  // Estado para el entrenamiento del modelo
  const [isTraining, setIsTraining] = useState<boolean>(false);
  
  // Verificar si el usuario tiene permisos de configuración
  const canManageConfig = hasPermission('config');

  const classificationReport = modelMetrics?.metrics?.classification_report;
  const averageReport = classificationReport?.['macro avg'] ?? classificationReport?.['weighted avg'] ?? null;

  const metricChartData = [
    {
      name: 'Accuracy',
      value: typeof modelMetrics?.accuracy === 'number' ? modelMetrics.accuracy : null,
      color: '#2563eb',
    },
    {
      name: 'Precision',
      value: typeof averageReport?.precision === 'number' ? averageReport.precision : null,
      color: '#f97316',
    },
    {
      name: 'Recall',
      value: typeof averageReport?.recall === 'number' ? averageReport.recall : null,
      color: '#16a34a',
    },
    {
      name: 'F1-Score',
      value:
        typeof averageReport?.['f1-score'] === 'number'
          ? averageReport['f1-score']
          : typeof modelMetrics?.metrics?.macro_f1 === 'number'
            ? modelMetrics.metrics.macro_f1
            : null,
      color: '#dc2626',
    },
  ];

  const hasMetricChartData = metricChartData.every((item) => typeof item.value === 'number');

  const applySettingsToUI = (settings: BackendSettings) => {
    setAlgoritmoActual(settings.algorithm);
    setModoAutomatico(settings.automatic_mode);
    setFrecuenciaActualizacion(settings.update_frequency_sec);
    setNotificacionesActivas(settings.notifications_enabled);
    setUmbralAlerta(settings.warning_threshold);
    setUmbralCritico(settings.critical_threshold);
    setRetentionDays(settings.retention_days);
    setApiEndpoint(settings.api_endpoint);
  };

  const loadSettings = async () => {
    setIsLoadingConfig(true);
    try {
      const response = await fetch(`${API_URL}/settings`);
      if (!response.ok) throw new Error('Error loading settings');
      const data: BackendSettings = await response.json();
      applySettingsToUI(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('No se pudo cargar la configuración real');
    } finally {
      setIsLoadingConfig(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);
  
  // Entrenar modelo de IA
  const handleTrainModel = async () => {
    setIsTraining(true);
    try {
      await trainModel();
      // Las notificaciones las maneja ServerContext
    } catch (error) {
      console.error('Error training model:', error);
      // Las notificaciones de error las maneja ServerContext
    } finally {
      setIsTraining(false);
    }
  };
  
  // Guardar configuración
  const saveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const payload: BackendSettings = {
        algorithm: algoritmoActual,
        automatic_mode: modoAutomatico,
        update_frequency_sec: frecuenciaActualizacion,
        notifications_enabled: notificacionesActivas,
        warning_threshold: umbralAlerta,
        critical_threshold: umbralCritico,
        retention_days: retentionDays,
        api_endpoint: apiEndpoint,
      };

      const response = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || 'Error saving settings');
      }

      const saved: BackendSettings = await response.json();
      applySettingsToUI(saved);
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar la configuración');
    } finally {
      setIsSavingConfig(false);
    }
  };
  
  // Restaurar valores predeterminados
  const restoreDefaults = async () => {
    setIsSavingConfig(true);
    try {
      const response = await fetch(`${API_URL}/settings/reset`, { method: 'POST' });
      if (!response.ok) throw new Error('Error resetting settings');

      const defaults: BackendSettings = await response.json();
      applySettingsToUI(defaults);
      toast.info('Valores predeterminados restaurados');
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast.error('No se pudo restaurar la configuración predeterminada');
    } finally {
      setIsSavingConfig(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Panel de Configuración
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Ajustes del sistema y personalización
        </p>
      </header>

      {isLoadingConfig && (
        <div className="rounded-md border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-700 dark:border-primary-900 dark:bg-primary-900/20 dark:text-primary-300">
          Cargando configuración real desde el backend...
        </div>
      )}

      {!canManageConfig ? (
        <div className="card p-6 text-center">
          <Lock className="h-12 w-12 text-warning-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Acceso Restringido
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            No tienes permisos suficientes para modificar la configuración.
            Por favor, contacta con un administrador.
          </p>
        </div>
      ) : (
        <>
          {/* Sección de entrenamiento del modelo de IA */}
          <div className="card">
            <div className="flex items-center mb-6">
              <Brain className="h-6 w-6 text-primary-500 mr-3" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Entrenamiento del Modelo de IA
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="label">Seleccionar Algoritmo de Machine Learning</label>
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    className="py-4 px-4 rounded-lg border-2 transition-all border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    disabled
                  >
                    <div className="text-left">
                      <div className="flex items-center mb-2">
                        <TrendingUp className="h-5 w-5 text-primary-500 mr-2" />
                        <span className="block font-medium text-gray-800 dark:text-white">Arbol de Decision</span>
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Modelo unico estandarizado en frontend y backend para consistencia operativa
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Métricas del modelo actual */}
              {modelMetrics && (
                <div className="p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Métricas del Último Entrenamiento
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Precisión</p>
                      <p className="text-lg font-bold text-primary-500">
                        {(modelMetrics.accuracy * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Macro F1</p>
                      <p className="text-lg font-bold text-primary-500">
                        {typeof modelMetrics.metrics?.macro_f1 === 'number'
                          ? modelMetrics.metrics.macro_f1.toFixed(3)
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Umbral Min.</p>
                      <p className="text-lg font-bold text-primary-500">
                        {typeof modelMetrics.metrics?.min_accuracy_threshold === 'number'
                          ? `${(modelMetrics.metrics.min_accuracy_threshold * 100).toFixed(0)}%`
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Muestras</p>
                      <p className="text-lg font-bold text-primary-500">
                        {modelMetrics.training_samples || 0}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Algoritmo</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {(modelMetrics.algorithm || modelMetrics.metrics?.selected_algorithm || 'decision_tree')
                        .replace('decision_tree', 'Arbol de Decision')}
                    </p>
                  </div>
                </div>
              )}

              {modelMetrics && (
                <div className="card border border-gray-100 dark:border-dark-600 bg-white dark:bg-dark-800">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                        Gráfica de métricas reales
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Valores tomados del último entrenamiento del modelo activo.
                      </p>
                    </div>
                    <div className="text-xs font-medium px-3 py-1 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300">
                      Datos del backend
                    </div>
                  </div>

                  {hasMetricChartData ? (
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metricChartData} margin={{ top: 20, right: 10, left: 0, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.12} />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: 'currentColor', fontSize: 12 }}
                            axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
                            tickLine={false}
                          />
                          <YAxis
                            domain={[0, 1]}
                            tickFormatter={(value) => `${Math.round(value * 100)}%`}
                            tick={{ fill: 'currentColor', fontSize: 12 }}
                            axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
                            tickLine={false}
                          />
                          <Tooltip
                            formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Valor']}
                            labelFormatter={(label) => `Métrica: ${label}`}
                          />
                          <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                            {metricChartData.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                            <LabelList
                              dataKey="value"
                              position="top"
                              formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                              style={{ fill: '#111827', fontWeight: 700, fontSize: 12 }}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-200 dark:border-dark-600 p-5 text-sm text-gray-500 dark:text-gray-400">
                      El modelo actual no expone todavía el desglose de precisión, recall y F1 en el backend.
                      Entrena el modelo una vez para mostrar la gráfica con datos reales.
                    </div>
                  )}
                </div>
              )}

              <button 
                onClick={handleTrainModel}
                disabled={isTraining}
                className={`btn btn-primary w-full md:w-auto ${isTraining ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isTraining ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Entrenando Modelo...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Entrenar Modelo
                  </>
                )}
              </button>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">Sobre el entrenamiento del modelo</p>
                  <p>
                    El sistema entrenará el modelo de IA utilizando los datos de tráfico históricos almacenados.
                    A mayor cantidad de datos, mejor será la precisión del modelo para predecir el servidor óptimo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de algoritmo de balanceo */}
          <div className="card">
            <div className="flex items-center mb-6">
              <Activity className="h-6 w-6 text-primary-500 mr-3" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Algoritmo de Balanceo
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="label">Algoritmo Activo</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button 
                    className={`py-3 px-4 rounded-lg flex items-center justify-center ${
                      algoritmoActual === 'ia' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-700 dark:text-gray-300 dark:hover:bg-dark-600'
                    }`}
                    onClick={() => setAlgoritmoActual('ia')}
                  >
                    <div className="text-center">
                      <span className="block font-medium">Balanceo IA</span>
                      <span className="text-xs opacity-80 mt-1 block">Basado en aprendizaje</span>
                    </div>
                  </button>
                  
                  <button 
                    className={`py-3 px-4 rounded-lg flex items-center justify-center ${
                      algoritmoActual === 'roundrobin' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-700 dark:text-gray-300 dark:hover:bg-dark-600'
                    }`}
                    onClick={() => setAlgoritmoActual('roundrobin')}
                  >
                    <div className="text-center">
                      <span className="block font-medium">Round Robin</span>
                      <span className="text-xs opacity-80 mt-1 block">Distribución secuencial</span>
                    </div>
                  </button>
                  
                  <button 
                    className={`py-3 px-4 rounded-lg flex items-center justify-center ${
                      algoritmoActual === 'leastconnections' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-700 dark:text-gray-300 dark:hover:bg-dark-600'
                    }`}
                    onClick={() => setAlgoritmoActual('leastconnections')}
                  >
                    <div className="text-center">
                      <span className="block font-medium">Least Connections</span>
                      <span className="text-xs opacity-80 mt-1 block">Menor número de conexiones</span>
                    </div>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Modo de Operación</label>
                  <div className="mt-2">
                    <label className="inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={modoAutomatico}
                        onChange={() => setModoAutomatico(!modoAutomatico)}
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-dark-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                      <span className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {modoAutomatico ? 'Automático' : 'Manual'}
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {modoAutomatico 
                        ? 'El sistema balanceará la carga automáticamente cuando sea necesario' 
                        : 'El balanceo debe ser ejecutado manualmente por un operador'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="frequency" className="label">
                    Frecuencia de Actualización: {frecuenciaActualizacion} segundos
                  </label>
                  <input 
                    id="frequency"
                    type="range"
                    min="1"
                    max="10"
                    value={frecuenciaActualizacion}
                    onChange={(e) => setFrecuenciaActualizacion(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-dark-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Más rápido (1s)</span>
                    <span>Más lento (10s)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de notificaciones y alertas */}
          <div className="card">
            <div className="flex items-center mb-6">
              <AlertCircle className="h-6 w-6 text-primary-500 mr-3" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Notificaciones y Alertas
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300">
                    Notificaciones Activas
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Recibir alertas sobre eventos del sistema
                  </p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notificacionesActivas}
                    onChange={() => setNotificacionesActivas(!notificacionesActivas)}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-dark-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">
                    Umbral de Advertencia: {umbralAlerta}%
                  </label>
                  <input 
                    type="range"
                    min="30"
                    max="90"
                    value={umbralAlerta}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setUmbralAlerta(val);
                      // Asegurar que umbral crítico sea mayor que el de alerta
                      if (val >= umbralCritico) {
                        setUmbralCritico(Math.min(val + 10, 100));
                      }
                    }}
                    className="w-full h-2 bg-gray-200 dark:bg-dark-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>30%</span>
                    <span>90%</span>
                  </div>
                </div>
                
                <div>
                  <label className="label">
                    Umbral Crítico: {umbralCritico}%
                  </label>
                  <input 
                    type="range"
                    min={umbralAlerta + 5}
                    max="100"
                    value={umbralCritico}
                    onChange={(e) => setUmbralCritico(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-dark-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{umbralAlerta + 5}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de interfaz de usuario */}
          <div className="card">
            <div className="flex items-center mb-6">
              <Settings className="h-6 w-6 text-primary-500 mr-3" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Interfaz de Usuario
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300">
                    Modo Oscuro
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Cambiar entre tema claro y oscuro
                  </p>
                </div>
                <button 
                  onClick={toggleTheme}
                  className="px-4 py-2 bg-gray-100 dark:bg-dark-700 rounded-md flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
                >
                  {theme === 'light' ? (
                    <>
                      <Moon className="h-4 w-4 mr-2" />
                      Activar Modo Oscuro
                    </>
                  ) : (
                    <>
                      <Sun className="h-4 w-4 mr-2" />
                      Activar Modo Claro
                    </>
                  )}
                </button>
              </div>
              
              <div>
                <label className="label">Retención de datos de logs</label>
                <select 
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(parseInt(e.target.value))}
                  className="input w-full"
                >
                  <option value="7">7 días</option>
                  <option value="14">14 días</option>
                  <option value="30">30 días</option>
                  <option value="60">60 días</option>
                  <option value="90">90 días</option>
                </select>
              </div>
            </div>
          </div>

          {/* Configuración avanzada (expandible) */}
          <div className="card">
            <button 
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="w-full flex items-center justify-between py-2"
            >
              <div className="flex items-center">
                <Settings className="h-6 w-6 text-primary-500 mr-3" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Configuración Avanzada
                </h2>
              </div>
              <ChevronDown 
                className={`h-5 w-5 text-gray-500 transition-transform ${isAdvancedOpen ? 'transform rotate-180' : ''}`} 
              />
            </button>
            
            {isAdvancedOpen && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-700 space-y-4">
                <div>
                  <label className="label">API Endpoint</label>
                  <input 
                    type="text" 
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                    className="input w-full"
                  />
                </div>
                
                <div className="p-3 bg-warning-50 dark:bg-warning-900/20 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 text-warning-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-warning-700 dark:text-warning-300">
                    Cambiar la configuración avanzada puede afectar el rendimiento del sistema. 
                    Se recomienda consultar la documentación antes de realizar modificaciones.
                  </p>
                </div>
                
                <div>
                  <button 
                    onClick={resetearSimulacion}
                    className="btn btn-secondary"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reiniciar Simulación
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3">
            <button 
              onClick={restoreDefaults}
              className="btn btn-secondary"
            >
              Restaurar Valores Predeterminados
            </button>
            <button 
              onClick={saveConfig}
              className="btn btn-primary"
              disabled={isSavingConfig}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSavingConfig ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Componente ChevronDown que no estaba importado
const ChevronDown = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default ConfigPanel;