import { useEffect, useState } from 'react';
import { FileText, Download, BarChart2, Calendar, FileCheck2, AlertCircle } from 'lucide-react';
import { obtenerMesAño } from '../../utils/dateUtils';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { Informe } from '../../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
type ReportPeriod = 'diario' | 'semanal' | 'mensual';

const Reports = () => {
  const { hasPermission } = useAuth();
  const [informes, setInformes] = useState<Informe[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('mensual');
  
  // Verificar si el usuario tiene permisos para ver informes
  const canViewReports = hasPermission('reports');

  const fetchReports = async () => {
    try {
      setIsLoadingReports(true);
      const response = await fetch(`${API_URL}/reports`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: Error al cargar informes`);

      const data = await response.json();
      const reports = Array.isArray(data.reports) ? data.reports : [];
      setInformes(reports);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudieron cargar los informes';
      toast.error(message);
    } finally {
      setIsLoadingReports(false);
    }
  };

  useEffect(() => {
    if (!canViewReports) return;
    fetchReports();
  }, [canViewReports]);
  
  // Función para generar un nuevo informe
  const generateReport = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch(`${API_URL}/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: selectedPeriod })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: No se pudo generar el informe`);

      const data = await response.json();
      const newReport = data.report as Informe;
      if (newReport) {
        setInformes((prev) => [newReport, ...prev.filter((report) => report.id !== newReport.id)]);
      }
      toast.success('Informe generado correctamente');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo generar el informe';
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Función para descargar un informe
  const downloadReport = (id: number) => {
    const report = informes.find((item) => item.id === id);
    if (!report) {
      toast.error('Informe no encontrado');
      return;
    }

    const csv = [
      'fecha,tipo,traficoPromedio,latenciaPromedio,eficienciaIA,incidentes',
      `${report.fecha},${report.tipoInforme},${report.metricas.traficoPromedio},${report.metricas.latenciaPromedio},${report.metricas.eficienciaIA},${report.metricas.incidentes}`
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_${report.tipoInforme}_${report.fecha}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.info('Informe descargado');
  };

  const reportPreview = informes[0] || null;

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

            {isLoadingReports && (
              <div className="text-center py-5 text-sm text-gray-500 dark:text-gray-400">
                Cargando informes reales del backend...
              </div>
            )}
            
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
                  {reportPreview
                    ? `Informe ${reportPreview.tipoInforme.charAt(0).toUpperCase() + reportPreview.tipoInforme.slice(1)} de Rendimiento`
                    : 'Sin datos de informe'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {reportPreview ? reportPreview.fecha : 'N/A'}
                </p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
                    Resumen Ejecutivo
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {reportPreview
                      ? `Reporte ${reportPreview.tipoInforme} construido con datos reales de tráfico registrados en backend. Se observaron ${reportPreview.metricas.incidentes} incidentes en el periodo y una eficiencia IA promedio de ${reportPreview.metricas.eficienciaIA}%.`
                      : 'Genera un informe para visualizar este resumen con datos reales.'}
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
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {reportPreview ? `${reportPreview.metricas.traficoPromedio} Mbps` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Incidentes:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {reportPreview ? reportPreview.metricas.incidentes : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Latencia Promedio:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {reportPreview ? `${reportPreview.metricas.latenciaPromedio} ms` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Eficiencia del Algoritmo IA:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {reportPreview ? `${reportPreview.metricas.eficienciaIA}%` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium text-gray-800 dark:text-white mb-3">
                      Incidentes y Resoluciones
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                      <p>Las incidencias se calculan con base en latencia alta, pérdida de paquetes y asignaciones fallidas registradas en logs reales.</p>
                      <p>Usa el módulo de Logs para revisar el detalle por evento y nodo.</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-dark-600">
                  <h4 className="text-md font-medium text-gray-800 dark:text-white mb-3">
                    Recomendaciones
                  </h4>
                  <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>Analizar periodos con mayor latencia y pérdida para ajustar capacidad.</li>
                    <li>Comparar eficiencia IA entre periodos diario, semanal y mensual.</li>
                    <li>Correlacionar incidentes con estado de nodos en la vista de Dashboard.</li>
                    <li>Ejecutar entrenamiento del modelo cuando baje la eficiencia IA.</li>
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