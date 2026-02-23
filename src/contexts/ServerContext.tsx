import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { toast } from 'react-toastify';

export interface Server {
  id: number;
  name: string;
  ip_address: string;
  port: number;
  status: 'active' | 'inactive' | 'maintenance';
  load_percentage: number;
  latency_ms: number;
  created_at: string;
  updated_at: string;
}

export interface TrafficMetrics {
  id: number;
  server_id: number;
  timestamp: string;
  throughput: number;
  latency: number;
  packet_loss: number;
  cpu_usage: number;
  memory_usage: number;
}

export interface TrafficLog {
  id: number;
  server_id: number;
  action: string;
  details: string;
  created_at: string;
}

export interface AITrainResponse {
  message: string;
  model_id: string;
  accuracy: number;
  status: string;
}

export interface ServerContextType {
  servers: Server[];
  logs: TrafficLog[];
  modelStatus: string;
  modelMetrics: any | null;
  loading: boolean;
  error: string | null;
  
  fetchServers: () => Promise<void>;
  fetchLogs: (limit: number, offset: number) => Promise<void>;
  trainModel: (algorithm: string) => Promise<void>;
  predictServer: (metrics: Partial<TrafficMetrics>) => Promise<any>;
  sendTraffic: (trafficData: Partial<TrafficMetrics>) => Promise<void>;
  createServer: (serverData: Partial<Server>) => Promise<void>;
  updateServer: (id: number, serverData: Partial<Server>) => Promise<void>;
  deleteServer: (id: number) => Promise<void>;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export const useServer = () => {
  const context = useContext(ServerContext);
  if (!context) {
    throw new Error('useServer debe ser usado dentro de un ServerProvider');
  }
  return context;
};

interface ServerProviderProps {
  children: ReactNode;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const ServerProvider = ({ children }: ServerProviderProps) => {
  const [servers, setServers] = useState<Server[]>([]);
  const [logs, setLogs] = useState<TrafficLog[]>([]);
  const [modelStatus, setModelStatus] = useState('idle');
  const [modelMetrics, setModelMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/servers`);
      if (!response.ok) throw new Error('Error fetching servers');
      const data = await response.json();
      setServers(Array.isArray(data) ? data : data.servers || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching servers');
      console.error('Error fetching servers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async (limit: number = 100, offset: number = 0) => {
    try {
      const response = await fetch(`${API_URL}/logs?limit=${limit}&offset=${offset}`);
      if (!response.ok) throw new Error('Error fetching logs');
      const data = await response.json();
      setLogs(Array.isArray(data) ? data : data.logs || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  }, []);

  const trainModel = useCallback(async (algorithm: string) => {
    try {
      setModelStatus('training');
      console.log('Iniciando entrenamiento con API_URL:', API_URL);
      const requestBody = { 
        algorithm,
        dataset_path: "6G_dataset_final.csv",
        label_column: "server_id",
        use_heuristic: true
      };
      console.log('Request body:', requestBody);
      
      const response = await fetch(`${API_URL}/ai/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Error response:', errorData, 'Status:', response.status);
        throw new Error(errorData.detail || `HTTP ${response.status}: Error training model`);
      }
      const data = await response.json();
      console.log('Train response:', data);
      setModelMetrics(data);
      setModelStatus('trained');
      const algorithmName = algorithm === 'random_forest' ? 'Random Forest' : 'Gradient Boosting';
      toast.success(`Modelo ${algorithmName} entrenado correctamente`);
    } catch (err) {
      setModelStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Error al entrenar el modelo';
      console.error('Error training model:', err);
      toast.error(errorMessage);
    }
  }, []);

  const predictServer = useCallback(async (metrics: Partial<TrafficMetrics>) => {
    try {
      const response = await fetch(`${API_URL}/ai/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      });
      if (!response.ok) throw new Error('Error predicting');
      return await response.json();
    } catch (err) {
      console.error('Error predicting:', err);
      return null;
    }
  }, []);

  const sendTraffic = useCallback(async (trafficData: Partial<TrafficMetrics>) => {
    try {
      const response = await fetch(`${API_URL}/traffic/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trafficData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Error response:', errorData);
        throw new Error(errorData.detail || 'Error sending traffic');
      }
      
      const result = await response.json();
      console.log('Traffic sent successfully:', result);
      toast.success(`Tráfico asignado a ${result.assigned_server_name}`);
      await fetchServers();
    } catch (err) {
      console.error('Error sending traffic:', err);
      toast.error('Error al enviar tráfico');
    }
  }, [fetchServers]);

  const createServer = useCallback(async (serverData: Partial<Server>) => {
    try {
      const response = await fetch(`${API_URL}/servers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || 'Error creating server');
      }
      
      const result = await response.json();
      toast.success(`Servidor ${result.name} creado exitosamente`);
      await fetchServers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear servidor';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchServers]);

  const updateServer = useCallback(async (id: number, serverData: Partial<Server>) => {
    try {
      const response = await fetch(`${API_URL}/servers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || 'Error updating server');
      }
      
      const result = await response.json();
      toast.success(`Servidor ${result.name} actualizado exitosamente`);
      await fetchServers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar servidor';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchServers]);

  const deleteServer = useCallback(async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/servers/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || 'Error deleting server');
      }
      
      toast.success('Servidor eliminado exitosamente');
      await fetchServers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar servidor';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchServers]);


  // Fetch initial data on mount
  useEffect(() => {
    fetchServers();
    fetchLogs(100, 0);
    
    // Set up auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchServers();
      fetchLogs(100, 0);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchServers, fetchLogs]);

  return (
    <ServerContext.Provider value={{
      servers,
      logs,
      modelStatus,
      modelMetrics,
      loading,
      error,
      fetchServers,
      fetchLogs,
      trainModel,
      predictServer,
      sendTraffic,
      createServer,
      updateServer,
      deleteServer
    }}>
      {children}
    </ServerContext.Provider>
  );
};
