'use client';

import React from 'react';
import Image from 'next/image';
import { User } from '@/types/auth';

interface MemberAvatarsProps {
  members?: User[];
  users?: User[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const MemberAvatars: React.FC<MemberAvatarsProps> = ({ 
  members, 
  users,
  maxDisplay = 3,
  size = 'sm'
}) => {
  const userList = members || users || [];
  const displayMembers = userList.slice(0, maxDisplay);
  const remainingCount = Math.max(0, userList.length - maxDisplay);

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  const offsetClasses = {
    sm: '-ml-1',
    md: '-ml-1.5',
    lg: '-ml-2'
  };

  return (
    <div className="flex items-center">
      {displayMembers.map((member, index) => (
        <div
          key={member.id}
          className={`relative ${index > 0 ? offsetClasses[size] : ''}`}
          title={`${member.name} (${member.username})`}
        >
          {member.avatar_url ? (
            <Image
              src={member.avatar_url}
              alt={member.name}
              width={size === 'sm' ? 24 : size === 'md' ? 32 : 40}
              height={size === 'sm' ? 24 : size === 'md' ? 32 : 40}
              className={`${sizeClasses[size]} rounded-full border-2 border-white object-cover`}
            />
          ) : (
            <div className={`${sizeClasses[size]} rounded-full border-2 border-white bg-gray-300 flex items-center justify-center font-medium text-gray-600`}>
              {member.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div
          className={`${sizeClasses[size]} ${offsetClasses[size]} rounded-full border-2 border-white bg-gray-100 flex items-center justify-center font-medium text-gray-600`}
          title={`+${remainingCount} more members`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};