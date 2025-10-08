'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { projectAPI } from '@/lib/projectApi';
import { Project } from '@/types/project';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { 
  FolderOpen, 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Plus,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  activeProjects: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    activeProjects: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const projectsData = await projectAPI.getProjects();
        setProjects(projectsData.slice(0, 6)); // Show only recent 6 projects

        // Calculate stats
        const totalProjects = projectsData.length;
        const activeProjects = projectsData.filter(p => 
          new Date(p.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;

        setStats({
          totalProjects,
          totalTasks: 0, // Will be calculated from API
          completedTasks: 0, // Will be calculated from API
          activeProjects
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Gagal memuat data dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: FolderOpen,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: Activity,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: CheckSquare,
      color: 'bg-purple-500',
      change: '+23%'
    },
    {
      title: 'Completed Tasks',
      value: stats.completedTasks,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+15%'
    }
  ];

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-6 space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">
              Selamat datang kembali, {user?.name}! 👋
            </h1>
            <p className="text-blue-100">
              Kelola proyek kolaboratif Anda dengan mudah dan efisien
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-sm text-green-600 mt-1">{stat.change} dari bulan lalu</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Projects */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/dashboard/projects')}
                  >
                    View All
                  </Button>
                </div>
              </div>
              <div className="p-6">
                {projects.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                    <p className="text-gray-500 mb-4">Get started by creating your first project</p>
                    <Button onClick={() => router.push('/dashboard/projects/new')}>
                      <Plus className="mr-2 w-4 h-4" />
                      Create Project
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FolderOpen className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{project.name}</h3>
                            <p className="text-sm text-gray-500">{project.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {project.users.length}
                          </div>
                          <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-4">
                <Button
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/projects/new')}
                >
                  <Plus className="mr-2 w-4 h-4" />
                  New Project
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/tasks')}
                >
                  <CheckSquare className="mr-2 w-4 h-4" />
                  View Tasks
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/sprints')}
                >
                  <Calendar className="mr-2 w-4 h-4" />
                  Manage Sprints
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/chat')}
                >
                  <MessageSquare className="mr-2 w-4 h-4" />
                  Team Chat
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}