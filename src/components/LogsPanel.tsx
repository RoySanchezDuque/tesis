import { EventoLog } from '../types';
import { AlertCircle, CheckCircle, AlertTriangle, Info, RefreshCcw } from 'lucide-react';
import { formatearFechaHora } from '../utils/dateUtils';

interface LogsPanelProps {
  logs: EventoLog[];
  compact?: boolean;
}

const LogsPanel = ({ logs, compact = false }: LogsPanelProps) => {
  // Obtener icono según el tipo de log
  const getLogIcon = (log: EventoLog) => {
    if (log.severidad === 'error') {
      return <AlertCircle className="h-5 w-5 text-danger-500" />;
    } else if (log.severidad === 'warning') {
      return <AlertTriangle className="h-5 w-5 text-warning-500" />;
    } else if (log.tipo === 'balanceo') {
      return <RefreshCcw className="h-5 w-5 text-primary-500" />;
    } else {
      return <Info className="h-5 w-5 text-success-500" />;
    }
  };

  // Obtener clase de estilo según la severidad
  const getLogClass = (severidad: 'info' | 'warning' | 'error') => {
    switch (severidad) {
      case 'error':
        return 'border-danger-200 dark:border-danger-900 bg-danger-50 dark:bg-danger-900/20';
      case 'warning':
        return 'border-warning-200 dark:border-warning-900 bg-warning-50 dark:bg-warning-900/20';
      default:
        return 'border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800';
    }
  };

  return (
    <div className="space-y-2">
      {logs.length > 0 ? (
        logs.map((log) => (
          <div 
            key={log.id} 
            className={`border ${getLogClass(log.severidad)} rounded-lg p-3 transition-all hover:shadow-md`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                {getLogIcon(log)}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {log.mensaje}
                </p>
                <div className="mt-1 flex justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatearFechaHora(log.timestamp)}
                  </span>
                  {log.nodoId && (
                    <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                      Nodo ID: {log.nodoId}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <CheckCircle className="h-10 w-10 mx-auto mb-2 text-success-500" />
          <p>No hay eventos registrados</p>
        </div>
      )}
      
      {!compact && logs.length > 0 && (
        <div className="flex justify-center mt-4">
          <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
            Cargar más eventos
          </button>
        </div>
      )}
    </div>
  );
};

export default LogsPanel;