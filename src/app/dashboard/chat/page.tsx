'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ChatRoom from '@/components/chat/ChatRoom';


interface Project {
  id: number;
  name: string;
  description?: string;
}

const ChatPage: React.FC = () => {
  const { user, token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user projects
  useEffect(() => {
    const loadProjects = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);

        // Mock projects for testing - replace with actual API call
        const mockProjects: Project[] = [
          { id: 1, name: 'DevSync Frontend', description: 'Frontend development project' },
          { id: 2, name: 'DevSync Backend', description: 'Backend API development' },
          { id: 3, name: 'Mobile App', description: 'React Native mobile application' }
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setProjects(mockProjects);
        
        // Auto-select first project
        if (mockProjects.length > 0) {
          setSelectedProjectId(mockProjects[0].id);
        }

      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [token]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please login to access the chat.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DevSync Chat</h1>
              <p className="text-gray-600">Real-time project communication</p>
            </div>
            
            {/* User info */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                <p className="text-xs text-gray-500">Online</p>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Project Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border h-full">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
                <p className="text-sm text-gray-500">Select a project to chat</p>
              </div>
              
              <div className="p-2">
                {projects.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No projects available</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => setSelectedProjectId(project.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedProjectId === project.id
                            ? 'bg-blue-50 border-blue-200 border text-blue-900'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="font-medium text-sm">{project.name}</div>
                        {project.description && (
                          <div className="text-xs text-gray-500 mt-1">{project.description}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            {selectedProjectId ? (
              <ChatRoom
                projectId={selectedProjectId}
                className="h-full"
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Project</h3>
                  <p className="text-gray-500">Choose a project from the sidebar to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* DevSync Info Footer */}
      <div className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              <span className="font-medium">DevSync Chat</span> - Real-time project communication
            </div>
            <div className="flex items-center space-x-4">
              <span>WebSocket: ws://localhost:8080/ws</span>
              <span>API: /api/v1/projects/:id/messages</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;