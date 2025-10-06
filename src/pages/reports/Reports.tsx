import { useState } from 'react';
import { informesIniciales } from '../../data/mockData';
import { FileText, Download, BarChart2, Calendar, FileCheck2, AlertCircle } from 'lucide-react';
import { obtenerMesAño } from '../../utils/dateUtils';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const Reports = () => {
  const { hasPermission } = useAuth();
  const [informes, setInformes] = useState(informesIniciales);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('mensual');
  
  // Verificar si el usuario tiene permisos para ver informes
  const canViewReports = hasPermission('reports');
  
  // Función para generar un nuevo informe
  const generateReport = () => {
    setIsGenerating(true);
    
    // Simular tiempo de generación
    setTimeout(() => {
      const newReport = {
        id: Math.max(...informes.map(i => i.id)) + 1,
        fecha: new Date().toISOString().split('T')[0],
        tipoInforme: selectedPeriod,
        metricas: {
          traficoPromedio: Math.round((Math.random() * 20 + 60) * 10) / 10,
          latenciaPromedio: Math.round((Math.random() * 10 + 45) * 10) / 10,
          eficienciaIA: Math.round((Math.random() * 10 + 80) * 10) / 10,
          incidentes: Math.floor(Math.random() * 5) + 1
        },
        url: '#'
      };
      
      setInformes([newReport, ...informes]);
      setIsGenerating(false);
      toast.success('Informe generado correctamente');
    }, 2000);
  };
  
  // Función para descargar un informe
  const downloadReport = (id: number) => {
    toast.info('Descargando informe...');
  };

  return (
    <div className="space-y-6 pb-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Informes
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Generación y gestión de informes de rendimiento
        </p>
      </header>

      {!canViewReports ? (
        <div className="card p-6 text-center">
          <AlertCircle className="h-12 w-12 text-warning-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Acceso Restringido
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            No tienes permisos suficientes para ver o generar informes.
            Por favor, contacta con un administrador.
          </p>
        </div>
      ) : (
        <>
          {/* Panel de generación de informes */}
          <div className="card">
            <div className="flex items-center mb-6">
              <FileText className="h-6 w-6 text-primary-500 mr-3" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Generar Nuevo Informe
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="label">Tipo de Informe</label>
                <select 
                  value={selectedPeriod} 
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="input w-full"
                >
                  <option value="diario">Informe Diario</option>
                  <option value="semanal">Informe Semanal</option>
                  <option value="mensual">Informe Mensual</option>
                </select>
              </div>
              
              <div>
                <label className="label">Formato</label>
                <select className="input w-full">
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button 
                  onClick={generateReport}
                  disabled={isGenerating}
                  className="btn btn-primary w-full"
                >
                  {isGenerating ? (
                    <>
                      <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Generando...
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="h-4 w-4 mr-2" />
                      Generar Informe
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 dark:bg-dark-700 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                El informe incluirá:
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mr-2"></div>
                  Métricas de tráfico y carga de red
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mr-2"></div>
                  Análisis de eficiencia del algoritmo IA
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mr-2"></div>
                  Eventos críticos y resoluciones
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mr-2"></div>
                  Gráficos comparativos de rendimiento
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mr-2"></div>
                  Estadísticas de disponibilidad de nodos
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mr-2"></div>
                  Recomendaciones de optimización
                </li>
              </ul>
            </div>
          </div>

          {/* Lista de informes recientes */}
          <div className="card">
            <div className="flex items-center mb-6">
              <BarChart2 className="h-6 w-6 text-primary-500 mr-3" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Informes Recientes
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
                <thead className="bg-gray-50 dark:bg-dark-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Período
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tráfico Promedio
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Latencia
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Eficiencia IA
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
                  {informes.map((informe) => (
                    <tr key={informe.id} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {obtenerMesAño(informe.fecha)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-100">
                          {informe.tipoInforme.charAt(0).toUpperCase() + informe.tipoInforme.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {informe.metricas.traficoPromedio} Mbps
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {informe.metricas.latenciaPromedio} ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2 mr-2 w-24">
                            <div 
                              className="bg-success-500 h-2 rounded-full" 
                              style={{ width: `${informe.metricas.eficienciaIA}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {informe.metricas.eficienciaIA}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button 
                          onClick={() => downloadReport(informe.id)}
                          className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 ml-3"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {informes.length === 0 && (
              <div className="text-center py-10">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                <p className="text-gray-600 dark:text-gray-300">No hay informes disponibles</p>
              </div>
            )}
          </div>

          {/* Previsualización de informe */}
          <div className="card">
            <div className="flex items-center mb-6">
              <FileText className="h-6 w-6 text-primary-500 mr-3" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Previsualización del Informe
              </h2>
            </div>
            
            <div className="bg-gray-50 dark:bg-dark-700 p-6 rounded-md border border-gray-200 dark:border-dark-600">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Informe Mensual de Rendimiento
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Abril 2025
                </p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
                    Resumen Ejecutivo
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Durante el mes de Abril de 2025, el sistema de balanceo de carga con IA ha mantenido 
                    una eficiencia del 87.2%, mejorando en un 3.3% respecto al mes anterior. Se gestionaron 
                    correctamente 3 incidentes sin impacto en el servicio, y se optimizó la distribución 
                    del tráfico durante periodos de alta demanda.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-800 dark:text-white mb-3">
                      Métricas Clave
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Tráfico Promedio:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">65.3 Mbps</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Pico de Tráfico:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">112.7 Mbps</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Latencia Promedio:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">48.7 ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Eficiencia del Algoritmo IA:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">87.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Disponibilidad:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">99.98%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium text-gray-800 dark:text-white mb-3">
                      Incidentes y Resoluciones
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                      <p><span className="font-medium">12/04/2025:</span> Pico de tráfico inesperado (112.7 Mbps) gestionado correctamente por el algoritmo IA.</p>
                      <p><span className="font-medium">17/04/2025:</span> Fallo en Servidor Web 1 detectado y tráfico redistribuido automáticamente.</p>
                      <p><span className="font-medium">25/04/2025:</span> Latencia elevada detectada y corregida mediante reconfiguración de balanceadores.</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-dark-600">
                  <h4 className="text-md font-medium text-gray-800 dark:text-white mb-3">
                    Recomendaciones
                  </h4>
                  <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>Incrementar capacidad del Servidor Web 1 para gestionar picos de tráfico.</li>
                    <li>Programar mantenimiento preventivo para el Router Principal.</li>
                    <li>Optimizar algoritmo IA para predecir con mayor precisión eventos de alta demanda.</li>
                    <li>Configurar balanceador secundario para mejorar redundancia del sistema.</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Este es un documento generado automáticamente. Para más detalles, consulte el informe completo.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;