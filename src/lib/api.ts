import axios from 'axios';
import { AuthResponse, DevLoginRequest } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('devsync_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('devsync_token');
      localStorage.removeItem('devsync_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  devLogin: async (data: DevLoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/dev-login', data);
    return response.data;
  },

  githubLogin: () => {
    // Redirect to GitHub OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/github`;
  },

  // Handle GitHub callback with code parameter
  githubCallback: async (code: string): Promise<AuthResponse> => {
    const response = await api.get<AuthResponse>(`/auth/github/callback?code=${code}`);
    return response.data;
  },
};

export default api;