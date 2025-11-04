import axios from 'axios';
import { AuthResponse, DevLoginRequest } from '@/types/auth';
import { ChatMessage, CreateMessageRequest, ChatFilter, User } from '@/types/project';

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
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      const networkError = new Error('Cannot connect to the server. Ensure the backend is running at http://localhost:8080');
      networkError.name = 'NetworkError';
      return Promise.reject(networkError);
    }

    // Handle HTTP errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('devsync_token');
      localStorage.removeItem('devsync_user');
      window.location.href = '/login';
    } else if (error.response?.status === 404) {
      console.error('Endpoint not found:', error.config?.url);
      const notFoundError = new Error(`Endpoint not found: ${error.config?.url}`);
      notFoundError.name = 'NotFoundError';
      return Promise.reject(notFoundError);
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.response.status, error.response.data);
      const serverError = new Error('A server error occurred. Please try again later.');
      serverError.name = 'ServerError';
      return Promise.reject(serverError);
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

// Chat API functions
export const getChatMessages = async (
  projectId: number, 
  filter?: ChatFilter
): Promise<ChatMessage[]> => {
  const params = new URLSearchParams();
  
  if (filter?.file_id) {
    params.append('file_id', filter.file_id.toString());
  }
  
  if (filter?.task_id) {
    params.append('task_id', filter.task_id.toString());
  }

  const queryString = params.toString();
  const url = `/projects/${projectId}/messages${queryString ? `?${queryString}` : ''}`;
  
  const response = await api.get<ChatMessage[]>(url);
  return response.data;
};

export const sendChatMessage = async (
  projectId: number, 
  messageData: CreateMessageRequest
): Promise<ChatMessage> => {
  const response = await api.post<ChatMessage>(`/projects/${projectId}/messages`, messageData);
  return response.data;
};

// Member Management API
export const searchUsers = async (query: string, limit?: number): Promise<User[]> => {
  const params = new URLSearchParams({ q: query });
  if (limit) params.append('limit', limit.toString());
  
  const response = await api.get<User[]>(`/users/search?${params.toString()}`);
  return response.data;
};

export const getProjectMembers = async (projectId: number): Promise<User[]> => {
  const response = await api.get<User[]>(`/projects/${projectId}/members`);
  return response.data;
};

export const addProjectMember = async (
  projectId: number, 
  memberData: { user_id?: number; email?: string; username?: string }
): Promise<{ message: string; user: User }> => {
  const response = await api.post(`/projects/${projectId}/members`, memberData);
  return response.data;
};

export const removeProjectMember = async (projectId: number, userId: number): Promise<void> => {
  await api.delete(`/projects/${projectId}/members/${userId}`);
};

export default api;