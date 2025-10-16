'use client';

import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '@/types/project';
import { MessageItem } from './MessageItem';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  currentUserId?: number;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  error,
  currentUserId,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-2 text-gray-500">Memuat pesan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-700 font-medium">Gagal memuat pesan</p>
          <p className="text-gray-500 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.13 8.13 0 01-2.939-.542l-3.061 3.061A1 1 0 015.586 21H3a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l3.061-3.061A8.13 8.13 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
            </svg>
          </div>
          <p className="text-gray-500">Belum ada pesan</p>
          <p className="text-gray-400 text-sm mt-1">Mulai percakapan dengan mengirim pesan pertama</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      {messages.map((message, index) => {
        const previousMessage = index > 0 ? messages[index - 1] : null;
        const isGrouped = !!(previousMessage && 
          previousMessage.user_id === message.user_id &&
          new Date(message.created_at).getTime() - new Date(previousMessage.created_at).getTime() < 300000); // 5 minutes

        return (
          <MessageItem
            key={message.id}
            message={message}
            isOwn={currentUserId ? message.user_id === currentUserId : false}
            isGrouped={isGrouped}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};