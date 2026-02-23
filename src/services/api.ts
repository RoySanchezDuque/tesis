const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
    const response = await fetch(`${API_URL}/servers`);
    if (!response.ok) throw new Error('Failed to fetch servers');
    return response.json();
  },

  async getById(id: number) {
    const response = await fetch(`${API_URL}/servers/${id}`);
    if (!response.ok) throw new Error('Failed to fetch server');
    return response.json();
  },

  async create(data: Partial<Server>) {
    const response = await fetch(`${API_URL}/servers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create server');
    return response.json();
  },

  async update(id: number, data: Partial<Server>) {
    const response = await fetch(`${API_URL}/servers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update server');
    return response.json();
  },

  async delete(id: number) {
    const response = await fetch(`${API_URL}/servers/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete server');
    return response.json();
  }
};

// Traffic API
export const TrafficAPI = {
  async sendTraffic(data: Partial<TrafficMetrics>) {
    const response = await fetch(`${API_URL}/traffic/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to send traffic');
    return response.json();
  },

  async getMetrics(limit: number = 100, offset: number = 0) {
    const response = await fetch(`${API_URL}/traffic/metrics?limit=${limit}&offset=${offset}`);
    if (!response.ok) throw new Error('Failed to fetch metrics');
    return response.json();
  }
};

// Logs API
export const LogsAPI = {
  async getLogs(limit: number = 100, offset: number = 0) {
    const response = await fetch(`${API_URL}/logs?limit=${limit}&offset=${offset}`);
    if (!response.ok) throw new Error('Failed to fetch logs');
    return response.json();
  }
};

// AI API
export const AiAPI = {
  async train(algorithm: string): Promise<AITrainResponse> {
    const response = await fetch(`${API_URL}/ai/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ algorithm })
    });
    if (!response.ok) throw new Error('Failed to train model');
    return response.json();
  },

  async predict(metrics: Partial<TrafficMetrics>) {
    const response = await fetch(`${API_URL}/ai/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics)
    });
    if (!response.ok) throw new Error('Failed to predict');
    return response.json();
  }
};

// Model API
export const ModelAPI = {
  async getStatus() {
    const response = await fetch(`${API_URL}/ai/model/status`);
    if (!response.ok) throw new Error('Failed to get model status');
    return response.json();
  },

  async evaluate() {
    const response = await fetch(`${API_URL}/ai/model/evaluate`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to evaluate model');
    return response.json();
  }
};
