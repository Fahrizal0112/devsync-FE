'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { projectAPI } from '@/lib/projectApi';
import { Project } from '@/types/project';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { ProjectMembers } from '@/components/projects/ProjectMembers';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ProjectMembersPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = parseInt(params.id as string);
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const projectData = await projectAPI.getProject(projectId);
        setProject(projectData);
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('Gagal memuat detail project');
        router.push('/dashboard/projects');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId, router]);

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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Project tidak ditemukan</h1>
            <Button onClick={() => router.push('/dashboard/projects')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Projects
            </Button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  // Determine if current user is the project owner
  const isOwner = Boolean(project.users && project.users.length > 0 && user?.id === project.users[0].id);
  const projectOwnerId = project.users && project.users.length > 0 ? project.users[0].id : undefined;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Members</h1>
                <p className="text-gray-600 mt-1">{project.name}</p>
              </div>
            </div>
          </div>

          {/* Members Component */}
          <ProjectMembers
            projectId={projectId}
            currentUserId={user?.id || 0}
            isOwner={isOwner}
            projectOwnerId={projectOwnerId}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}