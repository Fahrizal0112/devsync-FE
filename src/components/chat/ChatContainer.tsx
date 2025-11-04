'use client';

import React from 'react';
import { ChatFilter } from '@/types/project';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';

interface ChatContainerProps {
  projectId: number;
  filter?: ChatFilter;
  className?: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  projectId,
  filter,
  className = '',
}) => {
  const { user } = useAuth();
  const { isConnected, connectionError } = useWebSocket();
  const { messages, isLoading, error, sendMessage } = useChat({
    projectId,
    filter,
  });

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  return (
    <div className={`flex flex-col h-full bg-white border border-gray-200 rounded-lg m-4 ${className}`}>
      {/* Chat Header */}
      <ChatHeader filter={filter} />
      
      {/* Connection Status */}
      {!isConnected && (
        <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-yellow-700">
              {connectionError || 'Connecting to server...'}
            </span>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        error={error}
        currentUserId={user?.id}
      />

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        placeholder={
          filter?.file_id 
            ? "Discuss this file..."
            : filter?.task_id 
            ? "Discuss this task..."
            : "Type a message for the project..."
        }
      />
    </div>
  );
};