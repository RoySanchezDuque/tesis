const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Retry configuration
const MAX_RETRIES = 3;
const TIMEOUT_MS = 10000;

// Helper function with retry logic
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = MAX_RETRIES): Promise<Response> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(error.timeoutId);
    
    if (retries > 0 && (error.name === 'AbortError' || error.code === 'ECONNREFUSED')) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

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

// Servers API
export const ServersAPI = {
  async getAll() {
    try {
      const response = await fetchWithRetry(`${API_URL}/servers`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch servers`);
      return response.json();
    } catch (error: any) {
      throw new Error(`Could not load servers: ${error.message}`);
    }
  },

  async getById(id: number) {
    try {
      const response = await fetchWithRetry(`${API_URL}/servers/${id}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: Server not found`);
      return response.json();
    } catch (error: any) {
      throw new Error(`Could not load server: ${error.message}`);
    }
  },

  async create(data: Partial<Server>) {
    try {
      const response = await fetchWithRetry(`${API_URL}/servers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: Creation failed`);
      return response.json();
    } catch (error: any) {
      throw new Error(`Could not create server: ${error.message}`);
    }
  },

  async update(id: number, data: Partial<Server>) {
    try {
      const response = await fetchWithRetry(`${API_URL}/servers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: Update failed`);
      return response.json();
    } catch (error: any) {
      throw new Error(`Could not update server: ${error.message}`);
    }
  },

  async delete(id: number) {
    try {
      const response = await fetchWithRetry(`${API_URL}/servers/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: Delete failed`);
      return response.json();
    } catch (error: any) {
      throw new Error(`Could not delete server: ${error.message}`);
    }
  }
};

// Traffic API
export const TrafficAPI = {
  async sendTraffic(data: Partial<TrafficMetrics>) {
    try {
      const response = await fetchWithRetry(`${API_URL}/traffic/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: Send failed`);
      return response.json();
    } catch (error: any) {
      throw new Error(`Could not send traffic: ${error.message}`);
    }
  },

  async getMetrics(limit: number = 100, offset: number = 0) {
    try {
      const response = await fetchWithRetry(`${API_URL}/traffic/metrics?limit=${limit}&offset=${offset}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: Fetch failed`);
      return response.json();
    } catch (error: any) {
      throw new Error(`Could not fetch metrics: ${error.message}`);
    }
  }
};

// Logs API
export const LogsAPI = {
  async getLogs(limit: number = 100, offset: number = 0) {
    try {
      const response = await fetchWithRetry(`${API_URL}/logs?limit=${limit}&offset=${offset}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: Fetch failed`);
      return response.json();
    } catch (error: any) {
      throw new Error(`Could not fetch logs: ${error.message}`);
    }
  }
};

// AI API
export const AiAPI = {
  async train(): Promise<AITrainResponse> {
    try {
      const response = await fetchWithRetry(`${API_URL}/ai/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithm: 'decision_tree', auto_select_model: false })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: Training failed`);
      return response.json();
    } catch (error: any) {
      throw new Error(`Training failed: ${error.message}`);
    }
  },

  async predict(metrics: Partial<TrafficMetrics>) {
    try {
      const response = await fetchWithRetry(`${API_URL}/ai/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: Prediction failed`);
      return response.json();
    } catch (error: any) {
      throw new Error(`Prediction failed: ${error.message}`);
    }
  }
};

// Model API
export const ModelAPI = {
  async getStatus() {
    try {
      const response = await fetchWithRetry(`${API_URL}/model/status`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: Fetch failed`);
      return response.json();
    } catch (error: any) {
      throw new Error(`Could not get model status: ${error.message}`);
    }
  },

  async evaluate(dataset_path: string = '6G_dataset_final.csv') {
    try {
      const response = await fetchWithRetry(`${API_URL}/ai/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset_path, use_heuristic: true })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: Evaluation failed`);
      return response.json();
    } catch (error: any) {
      throw new Error(`Evaluation failed: ${error.message}`);
    }
  }
};
