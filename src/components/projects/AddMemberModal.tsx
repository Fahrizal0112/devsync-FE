'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { searchUsers, addProjectMember } from '@/lib/api';
import { User } from '@/types/auth';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  X, 
  Search, 
  UserPlus, 
  Mail,
  Users,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface AddMemberModalProps {
  projectId: number;
  existingMembers: User[];
  onSuccess: (user: User) => void;
  onCancel: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  projectId,
  existingMembers,
  onSuccess,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'invite'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingUserId, setAddingUserId] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState('');

  // Debounced search
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedSearch = useCallback(
    (query: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(async () => {
        if (query.trim().length < 2) {
          setSearchResults([]);
          return;
        }

        try {
          setLoading(true);
          const results = await searchUsers(query, 10);
          
          // Filter out existing members
          const existingMemberIds = existingMembers.map(member => member.id);
          const filteredResults = results.filter(user => !existingMemberIds.includes(user.id));
          
          setSearchResults(filteredResults);
        } catch (error: unknown) {
          console.error('Error searching users:', error);
          toast.error('Failed to search users');
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    [existingMembers]
  );

  useEffect(() => {
    if (activeTab === 'search') {
      debouncedSearch(searchQuery);
    }
  }, [searchQuery, debouncedSearch, activeTab]);

  const handleAddMember = async (user: User) => {
    try {
      setAddingUserId(user.id);
      const response = await addProjectMember(projectId, { user_id: user.id });
      onSuccess(response.user);
    } catch (error: unknown) {
      console.error('Error adding member:', error);
      const errorResponse = error && typeof error === 'object' && 'response' in error ? 
        (error as { response?: { status?: number } }).response : null;
      
      if (errorResponse?.status === 409) {
        toast.error('User is already a member of this project');
      } else {
        toast.error('Failed to add member');
      }
    } finally {
      setAddingUserId(null);
    }
  };

  const handleInviteByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setInviteLoading(true);
      setError('');
      
      const response = await addProjectMember(projectId, { email: email.trim() });
      onSuccess(response.user);
      toast.success(`Invitation sent to ${email}`);
    } catch (error: unknown) {
      console.error('Error inviting member:', error);
      
      const errorResponse = error && typeof error === 'object' && 'response' in error ? 
        (error as { response?: { status?: number } }).response : null;
      
      if (errorResponse?.status === 409) {
        setError('User is already a member of this project');
      } else if (errorResponse?.status === 404) {
        setError('User not found with this email address');
      } else {
        setError('Failed to invite member. Please try again.');
      }
    } finally {
      setInviteLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Add Member</h2>
              <p className="text-sm text-gray-500">Add new members to your project</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('search')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Search Users
            </button>
            <button
              onClick={() => setActiveTab('invite')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'invite'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Invite by Email
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'search' ? (
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by username or email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Search Results */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        {user.avatar_url ? (
                          <Image
                            src={user.avatar_url}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-medium text-gray-600">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{user.name}</h4>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddMember(user)}
                        disabled={addingUserId === user.id}
                      >
                        {addingUserId === user.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim().length >= 2 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p>No users found matching &quot;{searchQuery}&quot;</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p>Start typing to search for users...</p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleInviteByEmail} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter email address"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={inviteLoading}
                  />
                </div>
                {error && (
                  <div className="mt-2 flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">How it works</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      We&apos;ll send an invitation email to this address. If they don&apos;t have an account, 
                      they&apos;ll be prompted to create one.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <Button variant="outline" onClick={onCancel} disabled={inviteLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={inviteLoading || !email.trim()}>
                  {inviteLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};