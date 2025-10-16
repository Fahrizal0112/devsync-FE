'use client';

import React from 'react';
import Image from 'next/image';
import { ChatMessage } from '@/types/project';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface MessageItemProps {
  message: ChatMessage;
  isOwn: boolean;
  isGrouped: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwn,
  isGrouped,
}) => {
  // Early return if message is invalid
  if (!message || !message.content) {
    return null;
  }

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: id 
      });
    } catch {
      return new Date(dateString).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-1' : 'mt-4'}`}>
      <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isGrouped && (
          <div className={`flex-shrink-0 ${isOwn ? 'ml-2' : 'mr-2'}`}>
            <Image
              src={message.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.user?.name || 'User')}&background=6366f1&color=fff`}
              alt={message.user?.name || 'User'}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full"
            />
          </div>
        )}

        {/* Message content */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} ${isGrouped && !isOwn ? 'ml-10' : ''} ${isGrouped && isOwn ? 'mr-10' : ''}`}>
          {/* User name and timestamp */}
          {!isGrouped && (
            <div className={`flex items-center space-x-2 mb-1 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <span className="text-sm font-medium text-gray-700">
                {message.user?.name || 'User'}
              </span>
              <span className="text-xs text-gray-500">
                {formatTime(message.created_at)}
              </span>
            </div>
          )}

          {/* Message bubble */}
          <div
            className={`
              px-3 py-2 rounded-lg max-w-full break-words
              ${isOwn 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-900'
              }
              ${isGrouped 
                ? (isOwn ? 'rounded-br-sm' : 'rounded-bl-sm')
                : ''
              }
            `}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>

          {/* Context info (file/task) */}
          {(message.file || message.task) && (
            <div className="mt-1 text-xs text-gray-500">
              {message.file && (
                <span className="inline-flex items-center">
                  📁 {message.file.name}
                </span>
              )}
              {message.task && (
                <span className="inline-flex items-center">
                  📋 {message.task.title}
                </span>
              )}
            </div>
          )}

          {/* Timestamp for grouped messages */}
          {isGrouped && (
            <div className="text-xs text-gray-400 mt-1">
              {formatTime(message.created_at)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};