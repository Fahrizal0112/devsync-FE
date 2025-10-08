export interface User {
  id: number;
  github_id: number;
  username: string;
  email: string;
  name: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
  projects?: Project[] | null;
  tasks?: Task[] | null;
  comments?: any[] | null;
  chat_messages?: ChatMessage[] | null;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  github_repo: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  users?: User[] | null;
  files?: File[] | null;
  tasks?: Task[] | null;
  sprints?: Sprint[] | null;
  documentation?: any[] | null;
  chat_messages?: ChatMessage[] | null;
  deployments?: any[] | null;
  _count?: {
    files: number;
    tasks: number;
    messages: number;
  };
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  github_repo?: string;
  is_public: boolean;
}

export interface File {
  id: number;
  name: string;
  path: string;
  content?: string;
  file_url: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  project_id: number;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
  project?: Project;
  chat_messages?: ChatMessage[] | null;
  uploader?: User;
}

export interface CreateFileRequest {
  name: string;
  path: string;
  content: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee_id?: number;
  assignee?: User;
  due_date?: string;
  created_at: string;
  updated_at: string;
  labels?: string[];
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee_id?: number;
  due_date?: string;
  labels?: string[];
}

export interface Sprint {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'completed';
  project_id: number;
  tasks?: Task[];
  created_at: string;
  updated_at: string;
}

export interface CreateSprintRequest {
  name: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'completed';
}

export interface ChatMessage {
  id: number;
  content: string;
  user_id: number;
  user: User;
  project_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateMessageRequest {
  content: string;
}