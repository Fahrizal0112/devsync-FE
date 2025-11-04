'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/types/auth';
import { getProjectMembers, removeProjectMember } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AddMemberModal } from './AddMemberModal';
import { MemberList } from './MemberList';
import { 
  Users, 
  Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProjectMembersProps {
  projectId: number;
  currentUserId: number;
  isOwner: boolean;
  projectOwnerId?: number;
}

export const ProjectMembers: React.FC<ProjectMembersProps> = ({
  projectId,
  currentUserId,
  isOwner,
  projectOwnerId
}) => {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const membersData = await getProjectMembers(projectId);
      setMembers(membersData);
    } catch (error: unknown) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleAddMember = (newMember: User) => {
    setMembers(prev => [...prev, newMember]);
    setShowAddModal(false);
    toast.success(`${newMember.name} was added to the project`);
  };

  const handleRemoveMember = async (userId: number) => {
    try {
      await removeProjectMember(projectId, userId);
      setMembers(prev => prev.filter(member => member.id !== userId));
      toast.success('Member removed from project');
    } catch (error: unknown) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member from project');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-gray-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Project Members</h2>
            <p className="text-sm text-gray-500">
              {members.length} member{members.length !== 1 ? 's' : ''} in this project
            </p>
          </div>
        </div>
        
        {isOwner && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        )}
      </div>

      {/* Members List */}
      {members.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
          <p className="text-gray-500 mb-4">
            {isOwner 
              ? 'Start collaborating by adding members to your project' 
              : 'This project has no members yet'
            }
          </p>
          {isOwner && (
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Member
            </Button>
          )}
        </div>
      ) : (
        <MemberList
          members={members}
          currentUserId={currentUserId}
          isOwner={isOwner}
          onRemoveMember={handleRemoveMember}
          projectOwnerId={projectOwnerId}
        />
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <AddMemberModal
          projectId={projectId}
          existingMembers={members}
          onSuccess={handleAddMember}
          onCancel={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};