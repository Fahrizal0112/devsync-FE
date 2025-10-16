'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: number;
  content: string;
  user_id: number;
  user_name: string;
  project_id: number;
  created_at: string;
  type?: 'sent' | 'received';
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { user } = useAuth();
  const isOwn = message.user_id === user?.id;
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      // Show time for messages within 24 hours
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } else if (diffInHours < 24 * 7) {
      // Show day and time for messages within a week
      return date.toLocaleDateString('id-ID', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } else {
      // Show full date for older messages
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (userId: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500'
    ];
    return colors[userId % colors.length];
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isOwn && (
          <div className={`flex-shrink-0 w-8 h-8 rounded-full ${getAvatarColor(message.user_id)} flex items-center justify-center text-white text-xs font-medium mr-3`}>
            {getInitials(message.user_name)}
          </div>
        )}

        {/* Message content */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* User name (only for received messages) */}
          {!isOwn && (
            <span className="text-xs text-gray-500 mb-1 px-1">
              {message.user_name}
            </span>
          )}

          {/* Message bubble */}
          <div
            className={`relative px-4 py-2 rounded-lg shadow-sm ${
              isOwn
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
            }`}
          >
            {/* Message text */}
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>

            {/* Timestamp */}
            <div className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
              {formatTime(message.created_at)}
            </div>

            {/* Message status indicators for sent messages */}
            {isOwn && (
              <div className="flex items-center justify-end mt-1">
                {/* Sent indicator */}
                <svg
                  className="w-3 h-3 text-blue-100"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Own avatar placeholder for alignment */}
        {isOwn && (
          <div className="flex-shrink-0 w-8 h-8 ml-3" />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;