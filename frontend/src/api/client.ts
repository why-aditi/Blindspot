import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.detail || error.message || 'An error occurred';
    console.error('API Error:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

export const auditDataset = async (file: File, protectedCols: string, labelCol: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('protected_cols', protectedCols);
  formData.append('label_col', labelCol);

  const response = await apiClient.post('/audit', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const scoreModel = async (data: {
  X_test: number[][];
  y_true: number[];
  y_pred: number[];
  sensitive_features: number[];
}) => {
  const response = await apiClient.post('/score', data);
  return response.data;
};

export const healthCheck = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export const explainDecision = async (formData: FormData) => {
  const response = await apiClient.post('/explain', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export interface CorrectionPayload {
  strategy: 'pre' | 'in' | 'post';
  X_test: number[][];
  y_true: number[];
  y_pred: number[];
  sensitive_features: number[];
  X_train?: number[][];
  y_train?: number[];
  sensitive_train?: number[];
}

export const correctBias = async (data: CorrectionPayload) => {
  const response = await apiClient.post('/correct', data);
  return response.data;
};

export const scanText = async (text: string) => {
  const response = await apiClient.post('/nlp-scan', { text });
  return response.data;
};

export const monitorFairness = async (formData: FormData) => {
  const response = await apiClient.post('/monitor', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export default apiClient;
