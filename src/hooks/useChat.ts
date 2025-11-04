'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChatMessage, ChatFilter, CreateMessageRequest } from '@/types/project';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { getChatMessages, sendChatMessage } from '@/lib/api';

interface UseChatProps {
  projectId: number;
  filter?: ChatFilter;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
}

export const useChat = ({ projectId, filter }: UseChatProps): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { lastMessage } = useWebSocket();
  const { user } = useAuth();

  // Load initial messages
  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getChatMessages(projectId, filter);
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, filter]);

  // Send new message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    console.log('📤 Sending message:', { content: content.trim(), projectId, filter });

    try {
      const messageData: CreateMessageRequest = {
        content: content.trim(),
        file_id: filter?.file_id,
        task_id: filter?.task_id,
      };

      console.log('🚀 Calling API to send message:', messageData);
      
      // Optimistic update: Add message immediately for better UX
      const optimisticMessage: ChatMessage = {
        id: Date.now(), // Temporary ID
        content: content.trim(),
        user_id: user?.id || 1, // Use actual current user ID
        user: {
          id: user?.id || 1,
          username: user?.username || 'You',
          name: user?.name || 'You',
          avatar_url: user?.avatar_url || '',
          github_id: 0,
          email: user?.email || '',
          created_at: '',
          updated_at: ''
        },
        project_id: projectId,
        file_id: filter?.file_id || null,
        task_id: filter?.task_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add optimistic message
      setMessages(prev => [...prev, optimisticMessage]);
      console.log('✨ Added optimistic message to UI');
      
      await sendChatMessage(projectId, messageData);
      console.log('✅ Message sent successfully, WebSocket should broadcast the update');
      
      // Clear any previous errors
      setError(null);
    } catch (err) {
      let errorMessage = 'Failed to send message';

      if (err instanceof Error) {
        if (err.name === 'NetworkError') {
          errorMessage = 'Cannot connect to the server. Ensure the backend is running.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'Chat endpoint not found. Check backend configuration.';
        } else if (err.name === 'ServerError') {
          errorMessage = 'A server error occurred. Please try again.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      throw new Error(errorMessage); // Re-throw with user-friendly message
    }
  }, [projectId, filter, user]);

  // Handle real-time messages from WebSocket
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'chat_message') {
      console.log('🔄 WebSocket message received:', lastMessage);
      
      // Only process message if it belongs to current project
      if (lastMessage.project_id === projectId) {
        console.log('✅ Message belongs to current project:', projectId);
        
        // Convert WebSocket message format to ChatMessage format
        // WebSocket format: {type, project_id, data: {id, content, user_id, user, ...}}
        const messageData = lastMessage.data;
        
        if (!messageData?.content || !messageData?.id || !messageData?.user_id) {
          console.warn('⚠️ Invalid message data in WebSocket message:', lastMessage);
          return;
        }
        
        const chatMessage: ChatMessage = {
          id: messageData.id,
          content: messageData.content,
          user_id: messageData.user_id,
          user: messageData.user || {
            id: messageData.user_id,
            username: `User ${messageData.user_id}`, // Fallback
            name: `User ${messageData.user_id}`, // Fallback
            avatar_url: '', // Fallback
            github_id: 0,
            email: '',
            created_at: '',
            updated_at: ''
          },
          project_id: lastMessage.project_id,
          file_id: filter?.file_id || null,
          task_id: filter?.task_id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const matchesFilter = 
          (!filter?.file_id || chatMessage.file_id === filter.file_id) &&
          (!filter?.task_id || chatMessage.task_id === filter.task_id);

        console.log('🔍 Filter check:', { 
          matchesFilter, 
          filter, 
          messageFileId: chatMessage.file_id, 
          messageTaskId: chatMessage.task_id 
        });

        if (matchesFilter) {
          setMessages(prev => {
            // Check if this is a duplicate of an optimistic update
            const optimisticIndex = prev.findIndex(msg => 
              msg.content === chatMessage.content && 
              msg.user_id === chatMessage.user_id &&
              msg.id > Date.now() - 10000 // Optimistic messages have recent timestamps
            );
            
            console.log('📝 Processing WebSocket message:', { 
              messageContent: chatMessage.content, 
              optimisticIndex,
              currentMessageCount: prev.length 
            });
            
            if (optimisticIndex !== -1) {
              // Replace optimistic message with real WebSocket message
              console.log('🔄 Replacing optimistic message with WebSocket message');
              const newMessages = [...prev];
              newMessages[optimisticIndex] = chatMessage;
              return newMessages;
            }
            
            // Check if message already exists (avoid true duplicates)
            const exists = prev.some(msg => 
              msg.content === chatMessage.content && 
              msg.user_id === chatMessage.user_id &&
              Math.abs(new Date(msg.created_at).getTime() - new Date(chatMessage.created_at).getTime()) < 5000 &&
              msg.id < Date.now() - 10000 // Not an optimistic message
            );
            
            if (exists) {
              console.log('⚠️ Message already exists, skipping');
              return prev;
            }
            
            console.log('✨ Adding new WebSocket message to chat');
            return [...prev, chatMessage];
          });
        } else {
          console.log('❌ Message does not match current filter');
        }
      } else {
        console.log('❌ Message does not belong to current project');
      }
    }
  }, [lastMessage, projectId, filter]);

  // Load messages on mount and when dependencies change
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Refresh messages function
  const refreshMessages = useCallback(async () => {
    await loadMessages();
  }, [loadMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    refreshMessages,
  };
};