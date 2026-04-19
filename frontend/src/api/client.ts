import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

export default apiClient;
