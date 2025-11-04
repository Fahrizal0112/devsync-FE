'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { projectAPI } from '@/lib/projectApi';
import { Project, Task } from '@/types/project';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  Calendar, 
  Globe, 
  Lock,
  Github,
  Edit,
  Trash2,
  Plus,
  MessageCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { DeleteProjectModal } from '@/components/projects/DeleteProjectModal';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectMembers } from '@/components/projects/ProjectMembers';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = parseInt(params.id as string);
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Check if current user is project owner (assuming first user in users array is owner)
  const isOwner = project?.users && user ? project.users[0]?.id === user.id : false;
  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      const projectData = await projectAPI.getProject(projectId);
      setProject(projectData);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project details');
      router.push('/dashboard/projects');
    } finally {
      setLoading(false);
    }
  }, [projectId, router]);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId, fetchProject]);

  const handleEditProject = () => {
    setShowEditModal(true);
  };

  const handleDeleteProject = () => {
    setShowDeleteModal(true);
  };

  const handleProjectUpdated = (updatedProject: Project) => {
    setProject(updatedProject);
    setShowEditModal(false);
    toast.success('Project updated successfully');
  };

  const handleProjectDeleted = () => {
    setShowDeleteModal(false);
    toast.success('Project deleted successfully');
    router.push('/dashboard/projects');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('text') || mimeType.includes('code')) return '📝';
    return '📁';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner size="lg" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!project) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h1>
            <Button onClick={() => router.push('/dashboard/projects')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard/projects')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                <p className="text-gray-600 mt-1">{project.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="primary" 
                onClick={() => router.push(`/dashboard/projects/${project.id}/chat`)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </Button>
              <Button variant="outline" onClick={handleEditProject}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="secondary" onClick={handleDeleteProject}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Project Info Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main Info */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Project</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {project.is_public ? (
                    <Globe className="w-5 h-5 text-green-500" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-500" />
                  )}
                  <span className="text-gray-700">
                    {project.is_public ? 'Public Project' : 'Private Project'}
                  </span>
                </div>
                
                {project.github_repo && (
                  <div className="flex items-center space-x-3">
                    <Github className="w-5 h-5 text-gray-700" />
                    <a 
                      href={project.github_repo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {project.github_repo}
                    </a>
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-gray-700">Created: {formatDate(project.created_at)}</p>
                    <p className="text-gray-700">Updated: {formatDate(project.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Members Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <ProjectMembers 
                projectId={project.id}
                currentUserId={user?.id || 0}
                isOwner={isOwner}
              />
            </div>
          </div>

          {/* Files Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Files</h3>
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/projects/${project.id}/files`)}
                className="text-sm"
              >
                View All
              </Button>
            </div>
            
            {project.files && project.files.length > 0 ? (
              <div className="space-y-2">
                {project.files.slice(0, 5).map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.mime_type)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.path}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(file.file_size)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No files in this project yet.</p>
            )}
          </div>

          {/* Tasks Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Tasks ({project.tasks?.length || 0})
              </h2>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
            
            {project.tasks && project.tasks.length > 0 ? (
              <div className="space-y-3">
                {project.tasks.map((task: Task) => (
                  <div key={task.id} className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <p className="text-gray-600 mt-1">{task.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No tasks have been created</p>
              </div>
            )}
          </div>

          {/* Members Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <ProjectMembers 
              projectId={project.id}
              currentUserId={1} // TODO: Get from auth context
              isOwner={true} // TODO: Check if current user is owner
            />
          </div>
        </div>

        {/* Modals */}
        {showEditModal && project && (
          <ProjectForm
            project={project}
            onSuccess={handleProjectUpdated}
            onCancel={() => setShowEditModal(false)}
          />
        )}

        {showDeleteModal && project && (
          <DeleteProjectModal
            project={project}
            onSuccess={handleProjectDeleted}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}