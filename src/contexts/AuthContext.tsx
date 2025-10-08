'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN'; payload: { token: string; user: User } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INITIALIZE'; payload: { token: string; user: User } | null };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
    case 'INITIALIZE':
      if (action.payload) {
        return {
          ...state,
          user: action.payload.user,
          token: action.payload.token,
          isAuthenticated: true,
          isLoading: false,
        };
      }
      return { ...state, isLoading: false };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Initialize auth state from localStorage
    const token = localStorage.getItem('devsync_token');
    const userStr = localStorage.getItem('devsync_user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch({ type: 'INITIALIZE', payload: { token, user } });
      } catch {
        localStorage.removeItem('devsync_token');
        localStorage.removeItem('devsync_user');
        dispatch({ type: 'INITIALIZE', payload: null });
      }
    } else {
      dispatch({ type: 'INITIALIZE', payload: null });
    }
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('devsync_token', token);
    localStorage.setItem('devsync_user', JSON.stringify(user));
    dispatch({ type: 'LOGIN', payload: { token, user } });
  };

  const logout = () => {
    localStorage.removeItem('devsync_token');
    localStorage.removeItem('devsync_user');
    dispatch({ type: 'LOGOUT' });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};