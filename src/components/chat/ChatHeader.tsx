'use client';

import React from 'react';
import { ChatFilter } from '@/types/project';
import { MessageCircle, File, CheckSquare } from 'lucide-react';

interface ChatHeaderProps {
  filter?: ChatFilter;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ filter }) => {
  const getHeaderContent = () => {
    if (filter?.file_id) {
      return {
        icon: <File size={16} />,
        title: 'Chat File',
        subtitle: 'Discussion about this file',
      };
    }
    
    if (filter?.task_id) {
      return {
        icon: <CheckSquare size={16} />,
        title: 'Chat Task',
        subtitle: 'Discussion about this task',
      };
    }
    
    return {
      icon: <MessageCircle size={16} />,
      title: 'Chat Project',
      subtitle: 'General project discussion',
    };
  };

  const { icon, title, subtitle } = getHeaderContent();

  return (
    <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
      <div className="flex items-center space-x-2">
        <div className="text-gray-600">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};