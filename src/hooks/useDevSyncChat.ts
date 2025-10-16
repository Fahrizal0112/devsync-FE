'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';

interface ChatMessage {
  id: number;
  content: string;
  user_id: number;
  user_name: string;
  project_id: number;
  created_at: string;
  type?: 'sent' | 'received';
}

interface UseChatOptions {
  projectId: number;
  autoLoad?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

interface UseChatReturn {
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  connected: boolean;
  sendMessage: (content: string) => Promise<void>;
  loadMessages: () => Promise<void>;
  clearError: () => void;
  retryConnection: () => void;
}

export const useDevSyncChat = ({
  projectId,
  autoLoad = true,
  maxRetries = 3,
  retryDelay = 1000
}: UseChatOptions): UseChatReturn => {
  const { user, token } = useAuth();
  const { isConnected, lastMessage } = useWebSocket();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const retryCountRef = useRef(0);
  const lastMessageIdRef = useRef<number | null>(null);

  // DevSync API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

  // Load messages from DevSync REST API
  const loadMessages = useCallback(async () => {
    if (!token || !projectId) {
      setError('Missing authentication or project ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to access this project.');
        } else if (response.status === 404) {
          throw new Error('Project not found.');
        } else {
          throw new Error(`Failed to load messages: ${response.statusText}`);
        }
      }

      const data = await response.json();
      
      // Ensure data is an array
      const messagesArray = Array.isArray(data) ? data : data.messages || [];
      
      const messagesWithType = messagesArray.map((msg: ChatMessage) => ({
        ...msg,
        type: msg.user_id === user?.id ? 'sent' : 'received'
      }));
      
      setMessages(messagesWithType);
      retryCountRef.current = 0; // Reset retry count on success
      
      // Update last message ID for deduplication
      if (messagesWithType.length > 0) {
        lastMessageIdRef.current = Math.max(...messagesWithType.map((m: ChatMessage) => m.id));
      }
      
    } catch (err) {
      console.error('Error loading messages:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load messages';
      setError(errorMessage);
      
      // Auto-retry logic
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        setTimeout(() => {
          console.log(`Retrying to load messages (attempt ${retryCountRef.current}/${maxRetries})`);
          loadMessages();
        }, retryDelay * retryCountRef.current);
      }
    } finally {
      setLoading(false);
    }
  }, [token, projectId, user?.id, maxRetries, retryDelay, API_BASE_URL]);

  // Send message via DevSync REST API
  const sendMessage = useCallback(async (content: string) => {
    if (!token || !user || !projectId || !content.trim()) {
      setError('Missing required data to send message');
      return;
    }

    try {
      setSending(true);
      setError(null);

      // Optimistic update
      const optimisticMessage: ChatMessage = {
        id: Date.now(), // Temporary ID
        content: content.trim(),
        user_id: user.id,
        user_name: user.name || user.email,
        project_id: projectId,
        created_at: new Date().toISOString(),
        type: 'sent'
      };

      setMessages(prev => [...prev, optimisticMessage]);

      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          project_id: projectId
        }),
      });

      if (!response.ok) {
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to send messages to this project.');
        } else if (response.status === 429) {
          throw new Error('Too many messages. Please wait a moment before sending again.');
        } else {
          throw new Error(`Failed to send message: ${response.statusText}`);
        }
      }

      const sentMessage = await response.json();
      
      // Replace optimistic message with real message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id 
            ? { ...sentMessage, type: 'sent' }
            : msg
        )
      );

      // Update last message ID
      lastMessageIdRef.current = Math.max(lastMessageIdRef.current || 0, sentMessage.id);

    } catch (err) {
      console.error('Error sending message:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
    } finally {
      setSending(false);
    }
  }, [token, user, projectId, API_BASE_URL]);

  // Handle incoming WebSocket messages from DevSync
  useEffect(() => {
    if (!lastMessage || !projectId) return;

    try {
      // DevSync WebSocket message format: {"type": "chat_message", "project_id": 1, "data": {"message": {...}}}
      const wsMessage = typeof lastMessage === 'string' ? JSON.parse(lastMessage) : lastMessage;
      
      console.log('🔍 useDevSyncChat processing WebSocket message:', wsMessage);
      
      if (wsMessage.type === 'chat_message' && wsMessage.project_id === projectId) {
        // Extract message from data.message structure
        const messageData = wsMessage.data?.message;
        
        console.log('📋 Extracted message data:', messageData);
        
        // Validate message data
        if (!messageData || !messageData.id || !messageData.content) {
          console.warn('Invalid message data from DevSync WebSocket:', messageData);
          return;
        }
        
        // Prevent duplicate messages
        if (lastMessageIdRef.current && messageData.id <= lastMessageIdRef.current) {
          console.log('Ignoring duplicate or old message:', messageData.id);
          return;
        }
        
        // Only add if it's not from current user (to avoid duplicates with optimistic updates)
        if (messageData.user_id !== user?.id) {
          const newMessage: ChatMessage = {
            ...messageData,
            type: 'received'
          };

          console.log('✅ Adding new received message:', newMessage);

          setMessages(prev => {
            // Double-check for duplicates
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) {
              console.log('Message already exists, skipping:', newMessage.id);
              return prev;
            }
            
            return [...prev, newMessage];
          });
          
          // Update last message ID
          lastMessageIdRef.current = Math.max(lastMessageIdRef.current || 0, messageData.id);
        } else {
          console.log('Ignoring message from current user:', messageData.user_id, 'vs', user?.id);
        }
      } else {
        console.log('Message type or project_id mismatch:', {
          type: wsMessage.type,
          project_id: wsMessage.project_id,
          expected_project_id: projectId
        });
      }
    } catch (err) {
      console.error('Error processing DevSync WebSocket message:', err);
    }
  }, [lastMessage, projectId, user?.id]);

  // Auto-load messages on mount and project change
  useEffect(() => {
    if (autoLoad && projectId && token && user) {
      loadMessages();
    }
  }, [autoLoad, projectId, token, user, loadMessages]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Retry connection
  const retryConnection = useCallback(() => {
    setError(null);
    retryCountRef.current = 0;
    loadMessages();
  }, [loadMessages]);

  return {
    messages,
    loading,
    sending,
    error,
    connected: isConnected,
    sendMessage,
    loadMessages,
    clearError,
    retryConnection
  };
};