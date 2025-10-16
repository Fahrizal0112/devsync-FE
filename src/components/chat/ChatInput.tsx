'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  maxLength?: number;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  loading = false,
  placeholder = "Type your message...",
  maxLength = 1000
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120; // Max 5 lines approximately
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle send message
  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled && !loading) {
      onSendMessage(trimmedMessage);
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // Auto-resize on message change
  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  // Focus textarea when not disabled
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const isButtonDisabled = disabled || loading || !message.trim();

  return (
    <div className="p-4">
      <div className={`flex items-end space-x-3 transition-all duration-200 ${
        isFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}>
        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={`w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              disabled 
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                : 'bg-white text-gray-900 hover:border-gray-400'
            } ${
              message.length > maxLength * 0.9 
                ? 'border-yellow-400' 
                : 'border-gray-300'
            }`}
            style={{
              minHeight: '48px',
              maxHeight: '120px',
              scrollbarWidth: 'thin',
            }}
          />
          
          {/* Character counter */}
          {message.length > maxLength * 0.8 && (
            <div className={`absolute bottom-1 right-2 text-xs ${
              message.length > maxLength * 0.9 
                ? 'text-yellow-600' 
                : 'text-gray-400'
            }`}>
              {message.length}/{maxLength}
            </div>
          )}
        </div>

        {/* Send button */}
        <button
          onClick={handleSendMessage}
          disabled={isButtonDisabled}
          className={`flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 ${
            isButtonDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md'
          }`}
          title={
            disabled 
              ? 'Chat is disconnected' 
              : loading 
                ? 'Sending...' 
                : 'Send message (Enter)'
          }
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Helper text */}
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        <span>
          {disabled 
            ? 'Chat is disconnected' 
            : 'Press Enter to send, Shift+Enter for new line'
          }
        </span>
        
        {/* Connection indicator */}
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${
            disabled ? 'bg-red-400' : 'bg-green-400'
          }`} />
          <span>{disabled ? 'Offline' : 'Online'}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;