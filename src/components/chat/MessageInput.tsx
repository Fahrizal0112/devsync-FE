'use client';

import React, { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message...",
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    const messageToSend = message.trim();
    setIsSending(true);
    
    try {
      await onSendMessage(messageToSend);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-right',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-end space-x-3">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isSending}
            rows={1}
            className="
              w-full px-3 py-2.5 border border-gray-300 rounded-lg resize-none
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              max-h-32 min-h-[42px]
            "
            style={{
              height: 'auto',
              minHeight: '42px',
              maxHeight: '128px',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 128) + 'px';
            }}
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isSending}
          loading={isSending}
          size="md"
          className="px-3 py-2.5 h-[42px]"
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
};