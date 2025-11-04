'use client';

import React, { useEffect, useState } from 'react';
import { projectAPI } from '@/lib/projectApi';
import { Project } from '@/types/project';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { DeleteProjectModal } from '@/components/projects/DeleteProjectModal';
import { 
  FolderOpen, 
  Plus, 
  Grid3X3, 
  List, 
  Search, 
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { MemberAvatars } from '@/components/projects/MemberAvatars';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      // Debug: cek token dan user
      const token = localStorage.getItem('devsync_token');
      const user = localStorage.getItem('devsync_user');
      console.log('Token exists:', !!token);
      console.log('User exists:', !!user);
      
      const data = await projectAPI.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    setSelectedProject(null);
    setShowCreateModal(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setShowEditModal(true);
    setActiveDropdown(null);
  };

  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
    setActiveDropdown(null);
  };

  const handleViewProject = (project: Project) => {
    router.push(`/dashboard/projects/${project.id}`);
    setActiveDropdown(null);
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects([newProject, ...projects]);
    setShowCreateModal(false);
  };

  const handleProjectUpdated = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setShowEditModal(false);
  };

  const handleProjectDeleted = () => {
    if (selectedProject) {
      setProjects(projects.filter(p => p.id !== selectedProject.id));
      setShowDeleteModal(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
              <p className="mt-2 text-gray-600">Manage all your projects here</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button onClick={handleCreateProject}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Project
              </Button>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Projects Grid/List */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'No projects match your search.' : 'Get started by creating your first project.'}
              </p>
              {!searchQuery && (
                <div className="mt-6">
                  <Button onClick={handleCreateProject}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Project
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }>
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer ${
                    viewMode === 'list' ? 'p-4' : 'p-6'
                  }`}
                  onClick={() => handleViewProject(project)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {project.name}
                      </h3>
                      <p className="mt-1 text-gray-600 text-sm line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                    <div className="relative ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === project.id ? null : project.id);
                        }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                      
                      {activeDropdown === project.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <div className="py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProject(project);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProject(project);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProject(project);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <MemberAvatars users={project.users || []} maxDisplay={3} size="sm" />
                        <span className="text-xs">{project.users?.length || 0} member{(project.users?.length || 0) !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(project.created_at)}</span>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      project.is_public 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.is_public ? 'Public' : 'Private'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Click outside to close dropdown */}
        {activeDropdown && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setActiveDropdown(null)}
          />
        )}

        {/* Modals */}
        {showCreateModal && (
          <ProjectForm
            onSuccess={handleProjectCreated}
            onCancel={() => setShowCreateModal(false)}
          />
        )}

        {showEditModal && selectedProject && (
          <ProjectForm
            project={selectedProject}
            onSuccess={handleProjectUpdated}
            onCancel={() => setShowEditModal(false)}
          />
        )}

        {showDeleteModal && selectedProject && (
          <DeleteProjectModal
            project={selectedProject}
            onSuccess={handleProjectDeleted}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}