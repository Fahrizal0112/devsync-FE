import api from './api';
import { 
  Project, 
  CreateProjectRequest, 
  File, 
  CreateFileRequest, 
  Task, 
  CreateTaskRequest, 
  Sprint, 
  CreateSprintRequest, 
  ChatMessage, 
  CreateMessageRequest 
} from '@/types/project';

export const projectAPI = {
  // Projects
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },

  getProject: async (id: number): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  updateProject: async (id: number, data: Partial<CreateProjectRequest>): Promise<Project> => {
    const response = await api.put<Project>(`/projects/${id}`, data);
    return response.data;
  },

  deleteProject: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  // Files
  getProjectFiles: async (projectId: number): Promise<File[]> => {
    const response = await api.get<File[]>(`/projects/${projectId}/files`);
    return response.data;
  },

  getFile: async (projectId: number, fileId: number): Promise<File> => {
    const response = await api.get<File>(`/projects/${projectId}/files/${fileId}`);
    return response.data;
  },

  createFile: async (projectId: number, data: CreateFileRequest): Promise<File> => {
    const response = await api.post<File>(`/projects/${projectId}/files`, data);
    return response.data;
  },

  updateFile: async (projectId: number, fileId: number, data: Partial<CreateFileRequest>): Promise<File> => {
    const response = await api.put<File>(`/projects/${projectId}/files/${fileId}`, data);
    return response.data;
  },

  deleteFile: async (projectId: number, fileId: number): Promise<void> => {
    await api.delete(`/projects/${projectId}/files/${fileId}`);
  },

  // Upload File
  uploadFile: async (projectId: number, file: File, fileType?: string): Promise<File> => {
    const formData = new FormData();
    formData.append('file', file);
    if (fileType) {
      formData.append('file_type', fileType);
    }

    const response = await api.post<File>(`/projects/${projectId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Tasks
  getProjectTasks: async (projectId: number): Promise<Task[]> => {
    const response = await api.get<Task[]>(`/projects/${projectId}/tasks`);
    return response.data;
  },

  getTask: async (projectId: number, taskId: number): Promise<Task> => {
    const response = await api.get<Task>(`/projects/${projectId}/tasks/${taskId}`);
    return response.data;
  },

  createTask: async (projectId: number, data: CreateTaskRequest): Promise<Task> => {
    const response = await api.post<Task>(`/projects/${projectId}/tasks`, data);
    return response.data;
  },

  updateTask: async (projectId: number, taskId: number, data: Partial<CreateTaskRequest>): Promise<Task> => {
    const response = await api.put<Task>(`/projects/${projectId}/tasks/${taskId}`, data);
    return response.data;
  },

  deleteTask: async (projectId: number, taskId: number): Promise<void> => {
    await api.delete(`/projects/${projectId}/tasks/${taskId}`);
  },

  // Sprints
  getProjectSprints: async (projectId: number): Promise<Sprint[]> => {
    const response = await api.get<Sprint[]>(`/projects/${projectId}/sprints`);
    return response.data;
  },

  getSprint: async (projectId: number, sprintId: number): Promise<Sprint> => {
    const response = await api.get<Sprint>(`/projects/${projectId}/sprints/${sprintId}`);
    return response.data;
  },

  createSprint: async (projectId: number, data: CreateSprintRequest): Promise<Sprint> => {
    const response = await api.post<Sprint>(`/projects/${projectId}/sprints`, data);
    return response.data;
  },

  updateSprint: async (projectId: number, sprintId: number, data: Partial<CreateSprintRequest>): Promise<Sprint> => {
    const response = await api.put<Sprint>(`/projects/${projectId}/sprints/${sprintId}`, data);
    return response.data;
  },

  deleteSprint: async (projectId: number, sprintId: number): Promise<void> => {
    await api.delete(`/projects/${projectId}/sprints/${sprintId}`);
  },

  // Chat Messages
  getProjectMessages: async (projectId: number): Promise<ChatMessage[]> => {
    const response = await api.get<ChatMessage[]>(`/projects/${projectId}/messages`);
    return response.data;
  },

  createMessage: async (projectId: number, data: CreateMessageRequest): Promise<ChatMessage> => {
    const response = await api.post<ChatMessage>(`/projects/${projectId}/messages`, data);
    return response.data;
  },
};