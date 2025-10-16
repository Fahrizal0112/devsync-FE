'use client';

import React, { useEffect, useRef } from 'react';
import { useDevSyncChat } from '@/hooks/useDevSyncChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ConnectionStatus from './ConnectionStatus';

interface ChatRoomProps {
  projectId: number;
  className?: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ projectId, className = '' }) => {
  const {
    messages,
    loading,
    sending,
    error,
    connected,
    sendMessage,
    retryConnection
  } = useDevSyncChat({ projectId });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleRetry = () => {
    retryConnection();
  };

  return (
    <div className={`flex flex-col bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Project Chat #{projectId}
          </h3>
          <p className="text-sm text-gray-500">
            Real-time project communication
          </p>
        </div>
        
        <ConnectionStatus 
          isConnected={connected}
          showText={true}
        />
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
        style={{ maxHeight: 'calc(100vh - 300px)' }}
      >
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h4>
              <p className="text-gray-500">Start the conversation by sending a message!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-red-700">{error}</span>
            </div>
            <button
              onClick={handleRetry}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t bg-gray-50 rounded-b-lg">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={!connected}
          loading={sending}
          placeholder={
            !connected 
              ? "Disconnected - reconnecting..." 
              : "Type your message..."
          }
        />
      </div>

      {/* Connection Status Footer */}
      {!connected && (
        <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm text-yellow-700">
                Connection lost. Attempting to reconnect...
              </span>
            </div>
            <button
              onClick={handleRetry}
              className="text-sm text-yellow-600 hover:text-yellow-800 font-medium"
            >
              Retry Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;