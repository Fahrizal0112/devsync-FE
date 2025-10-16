'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { User } from '@/types/auth';
import { Button } from '@/components/ui/Button';
import { 
  MoreVertical, 
  Crown, 
  UserMinus, 
  User as UserIcon
} from 'lucide-react';

interface MemberListProps {
  members: User[];
  currentUserId: number;
  isOwner: boolean;
  onRemoveMember: (userId: number) => void;
  projectOwnerId?: number;
}

export const MemberList: React.FC<MemberListProps> = ({
  members,
  currentUserId,
  isOwner,
  onRemoveMember,
  projectOwnerId
}) => {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  const handleRemoveMember = (userId: number) => {
    onRemoveMember(userId);
    setActiveDropdown(null);
  };

  const getRoleIcon = (userId: number) => {
    if (userId === projectOwnerId) {
      return (
        <span title="Owner">
          <Crown className="w-4 h-4 text-yellow-500" />
        </span>
      );
    }
    return (
      <span title="Member">
        <UserIcon className="w-4 h-4 text-gray-400" />
      </span>
    );
  };

  const getRoleText = (userId: number) => {
    if (userId === projectOwnerId) {
      return 'Owner';
    }
    return 'Member';
  };

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            {member.avatar_url ? (
              <Image
                src={member.avatar_url}
                alt={member.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-medium text-gray-600">
                {member.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900">{member.name}</h4>
                {getRoleIcon(member.id)}
              </div>
              <p className="text-sm text-gray-500">@{member.username}</p>
              <p className="text-xs text-gray-400">{member.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              member.id === projectOwnerId 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {getRoleText(member.id)}
            </span>

            {isOwner && member.id !== currentUserId && member.id !== projectOwnerId && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveDropdown(activeDropdown === member.id ? null : member.id)}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>

                {activeDropdown === member.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        Remove from Project
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};