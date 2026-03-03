import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const jobAPI = {
  async createJob(endpoint: string, formData: FormData): Promise<{ job_id: string }> {
    const response = await api.post(endpoint, formData);
    return response.data;
  },

  async getJobStatus(jobId: string): Promise<{
    job_id: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    download_url?: string;
    error_message?: string;
  }> {
    const response = await api.get(`/api/jobs/status/${jobId}`);
    return response.data;
  },

  getDownloadUrl(jobId: string): string {
    return `${API_BASE}/api/jobs/download/${jobId}`;
  },

  async checkHealth(): Promise<{ status: string }> {
    const response = await api.get('/api/health');
    return response.data;
  },
};

export default api;
