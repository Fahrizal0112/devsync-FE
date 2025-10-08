export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  avatar_url: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface DevLoginRequest {
  username: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}