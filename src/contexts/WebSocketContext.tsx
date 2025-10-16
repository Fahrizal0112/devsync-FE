'use client';

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import { WebSocketMessage } from '@/types/project';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (message: Record<string, unknown>) => void;
  lastMessage: WebSocketMessage | null;
  connectionError: string | null;
  connect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
  projectId?: number;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, projectId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3; // Limit reconnection attempts
  const { isAuthenticated, token } = useAuth();

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      console.log('🔗 WebSocket already connected');
      return;
    }

    if (!isAuthenticated || !token) {
      console.log('❌ Authentication required for WebSocket connection');
      setConnectionError('Authentication required for WebSocket connection');
      return;
    }

    if (!projectId) {
      console.log('❌ Project ID required for WebSocket connection');
      setConnectionError('Project ID required for WebSocket connection');
      return;
    }

    try {
      // Use DevSync backend WebSocket URL with project_id
      const wsUrl = `ws://localhost:8080/ws?token=${encodeURIComponent(token)}&project_id=${projectId}`;
      console.log('🚀 Attempting DevSync WebSocket connection to:', wsUrl);
      console.log('🔑 Using token:', token ? `${token.substring(0, 10)}...` : 'No token');
      console.log('🏗️ Using project_id:', projectId);
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('✅ DevSync WebSocket connected successfully');
        setIsConnected(true);
        setConnectionError(null);
        
        // Reset retry count on successful connection
        retryCountRef.current = 0;
        
        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.current.onmessage = (event) => {
        try {
          console.log('📨 Raw DevSync WebSocket message received:', event.data);
          const data = JSON.parse(event.data);
          console.log('📋 Parsed DevSync WebSocket message:', data);
          
          // Debug validation step by step
          console.log('🔍 Validation checks:');
          console.log('  - data exists:', !!data);
          console.log('  - is object:', typeof data === 'object');
          console.log('  - type:', data?.type);
          console.log('  - project_id:', data?.project_id);
          console.log('  - data.user_id:', data?.data?.user_id);
          console.log('  - data field:', data?.data);
          console.log('  - data.content:', data?.data?.content);
          console.log('  - data.id:', data?.data?.id);
          
          // Validasi struktur pesan sesuai dengan format backend yang sebenarnya
          if (data && 
              typeof data === 'object' && 
              data.type === 'chat_message' &&
              data.project_id &&
              data.data &&
              data.data.user_id &&
              data.data.content &&
              data.data.id &&
              data.data.user &&
              typeof data.data.user === 'object') {
            console.log('✅ Valid DevSync WebSocket message format, setting lastMessage');
            // Create a new object to ensure state update triggers
            const newMessage = {
              ...data,
              timestamp: Date.now() // Add timestamp to ensure uniqueness
            } as WebSocketMessage;
            setLastMessage(newMessage);
          } else {
            console.warn('⚠️ Invalid DevSync WebSocket message format:', data);
          }
        } catch (error) {
          console.error('❌ Error parsing DevSync WebSocket message:', error, 'Raw data:', event.data);
        }
      };

      ws.current.onclose = (event) => {
        console.log('🔌 DevSync WebSocket disconnected - Code:', event.code, 'Reason:', event.reason);
        setIsConnected(false);
        
        // Auto-reconnect jika bukan manual disconnect dan belum mencapai max retries
        if (event.code !== 1000 && isAuthenticated && retryCountRef.current < maxRetries) {
          retryCountRef.current += 1;
          console.log(`🔄 DevSync connection lost, attempting to reconnect (${retryCountRef.current}/${maxRetries}) in 3 seconds...`);
          setConnectionError(`Connection lost. Attempting to reconnect (${retryCountRef.current}/${maxRetries})...`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        } else if (retryCountRef.current >= maxRetries) {
          console.log('🛑 Max reconnection attempts reached. WebSocket disabled.');
          setConnectionError('WebSocket tidak tersedia. Aplikasi akan berjalan tanpa fitur real-time.');
        } else {
          console.log('🛑 Manual disconnect or not authenticated, not reconnecting');
        }
      };

      ws.current.onerror = (error) => {
        console.warn('⚠️ DevSync WebSocket connection failed:', error);
        setConnectionError('WebSocket tidak tersedia. Aplikasi akan berjalan tanpa fitur real-time.');
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Error creating DevSync WebSocket connection:', error);
      setConnectionError('Failed to create DevSync WebSocket connection');
    }
  }, [isAuthenticated, token, projectId]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (ws.current) {
      ws.current.close(1000, 'Manual disconnect');
      ws.current = null;
    }
    setIsConnected(false);
    setConnectionError(null);
  }, []);

  const sendMessage = (message: Record<string, unknown>) => {
    console.log('📤 Attempting to send DevSync WebSocket message:', message);
    console.log('🔗 DevSync WebSocket readyState:', ws.current?.readyState);
    
    if (ws.current?.readyState === WebSocket.OPEN) {
      const messageStr = JSON.stringify(message);
      console.log('✅ Sending DevSync WebSocket message:', messageStr);
      ws.current.send(messageStr);
    } else {
      console.error('❌ DevSync WebSocket is not connected, readyState:', ws.current?.readyState);
      setConnectionError('Cannot send message: DevSync WebSocket not connected');
    }
  };

  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, token, connect, disconnect]);

  // Add simulation event listener for testing
  useEffect(() => {
    const handleSimulatedMessage = (event: CustomEvent) => {
      console.log('🧪 Simulated DevSync WebSocket message received:', event.detail);
      const data = event.detail;
      
      // Debug validation step by step
      console.log('🔍 Simulation Validation checks:');
      console.log('  - data exists:', !!data);
      console.log('  - is object:', typeof data === 'object');
      console.log('  - type:', data?.type);
      console.log('  - project_id:', data?.project_id);
      console.log('  - user_id:', data?.user_id);
      console.log('  - data field:', data?.data);
      console.log('  - data.message:', data?.data?.message);
      
      // Use same validation logic as real WebSocket
      if (data && 
          typeof data === 'object' &&
          data.type === 'chat_message' &&
          data.project_id &&
          data.data &&
          data.data.content &&
          data.data.user_id &&
          data.data.id) {
        console.log('✅ Valid simulated DevSync WebSocket message format, setting lastMessage');
        // Create a new object to ensure state update triggers
        const newMessage = {
          ...data,
          timestamp: Date.now() // Add timestamp to ensure uniqueness
        } as WebSocketMessage;
        setLastMessage(newMessage);
      } else {
        console.warn('⚠️ Invalid simulated DevSync WebSocket message format:', data);
      }
    };

    window.addEventListener('simulate-websocket-message', handleSimulatedMessage as EventListener);
    
    return () => {
      window.removeEventListener('simulate-websocket-message', handleSimulatedMessage as EventListener);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const value: WebSocketContextType = {
    isConnected,
    sendMessage,
    lastMessage,
    connectionError,
    connect,
    disconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};