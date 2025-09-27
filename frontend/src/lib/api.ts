import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Error Response:', error.response.data);
    } else if (error.request) {
      console.error('API Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Types
export interface ClassificationRequest {
  text: string;
  vectorization_method: 'bow' | 'tfidf' | 'embeddings';
  model_name?: 'kmeans' | 'knn' | 'decision_tree' | 'naive_bayes';
}

export interface ModelPrediction {
  prediction: string;
  confidence: number;
  error?: string;
}

export interface ClassificationResponse {
  input_text: string;
  vectorization_method: string;
  predictions: Record<string, ModelPrediction>;
  processing_time: number;
}

export interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
}

export interface TrainingStatus {
  models_trained: Record<string, boolean>;
  vectorizers_fitted: Record<string, boolean>;
  available_categories: string[];
}

// API functions
export const healthCheck = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>('/health');
  return response.data;
};

export const getStatus = async (): Promise<TrainingStatus> => {
  const response = await apiClient.get<TrainingStatus>('/status');
  return response.data;
};

export const classifyText = async (
  request: ClassificationRequest
): Promise<ClassificationResponse> => {
  const response = await apiClient.post<ClassificationResponse>('/classify', request);
  return response.data;
};

export const initializeService = async (): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/initialize');
  return response.data;
};

// Utility functions
export const isServiceReady = async (): Promise<boolean> => {
  try {
    const health = await healthCheck();
    return health.status === 'ready';
  } catch {
    return false;
  }
};

export const waitForService = async (maxAttempts: number = 30): Promise<boolean> => {
  for (let i = 0; i < maxAttempts; i++) {
    const ready = await isServiceReady();
    if (ready) return true;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  return false;
};