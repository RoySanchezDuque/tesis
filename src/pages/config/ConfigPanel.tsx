import { useState } from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useServer } from '../../contexts/ServerContext';
import { Settings, Save, AlertCircle, Lock, Moon, Sun, RefreshCw, Activity, Brain, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';

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
  
  // Estado para el entrenamiento del modelo
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'random_forest' | 'gradient_boosting'>('random_forest');
  const [isTraining, setIsTraining] = useState<boolean>(false);
  
  // Verificar si el usuario tiene permisos de configuración
  const canManageConfig = hasPermission('config');
  
  // Entrenar modelo de IA
  const handleTrainModel = async () => {
    setIsTraining(true);
    try {
      await trainModel(selectedAlgorithm);
      // Las notificaciones las maneja ServerContext
    } catch (error) {
      console.error('Error training model:', error);
      // Las notificaciones de error las maneja ServerContext
    } finally {
      setIsTraining(false);
    }
  };
  
  // Guardar configuración
  const saveConfig = () => {
    toast.success('Configuración guardada correctamente');
  };
  
  // Restaurar valores predeterminados
  const restoreDefaults = () => {
    setAlgoritmoActual('ia');
    setModoAutomatico(true);
    setFrecuenciaActualizacion(5);
    setNotificacionesActivas(true);
    setUmbralAlerta(60);
    setUmbralCritico(80);
    setRetentionDays(30);
    setApiEndpoint("https://api.balanceo-ia.edu/v1");
    
    toast.info('Valores predeterminados restaurados');
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button 
                    className={`py-4 px-4 rounded-lg border-2 transition-all ${
                      selectedAlgorithm === 'random_forest' 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                        : 'border-gray-200 dark:border-dark-700 hover:border-gray-300 dark:hover:border-dark-600'
                    }`}
                    onClick={() => setSelectedAlgorithm('random_forest')}
                  >
                    <div className="text-left">
                      <div className="flex items-center mb-2">
                        <TrendingUp className="h-5 w-5 text-primary-500 mr-2" />
                        <span className="block font-medium text-gray-800 dark:text-white">Random Forest</span>
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Algoritmo de ensamble robusto, ideal para datos con múltiples características
                      </span>
                    </div>
                  </button>
                  
                  <button 
                    className={`py-4 px-4 rounded-lg border-2 transition-all ${
                      selectedAlgorithm === 'gradient_boosting' 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                        : 'border-gray-200 dark:border-dark-700 hover:border-gray-300 dark:hover:border-dark-600'
                    }`}
                    onClick={() => setSelectedAlgorithm('gradient_boosting')}
                  >
                    <div className="text-left">
                      <div className="flex items-center mb-2">
                        <TrendingUp className="h-5 w-5 text-primary-500 mr-2" />
                        <span className="block font-medium text-gray-800 dark:text-white">Gradient Boosting</span>
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Optimización secuencial, mayor precisión en predicciones complejas
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
                      <p className="text-xs text-gray-500 dark:text-gray-400">R² Score</p>
                      <p className="text-lg font-bold text-primary-500">
                        {modelMetrics.r2_score?.toFixed(3) || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">MSE</p>
                      <p className="text-lg font-bold text-primary-500">
                        {modelMetrics.mse?.toFixed(2) || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Registros</p>
                      <p className="text-lg font-bold text-primary-500">
                        {modelMetrics.training_records || 0}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Algoritmo</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {modelMetrics.model_type === 'random_forest' ? 'Random Forest' : 'Gradient Boosting'}
                    </p>
                  </div>
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
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Configuración
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