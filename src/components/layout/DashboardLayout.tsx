'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { projectAPI } from '@/lib/projectApi';
import { 
  FolderOpen, 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  Settings, 
  Search, 
  Bell, 
  ChevronDown, 
  LogOut,
  Menu,
  X,
  Home,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { Project } from '@/types/project';
import { toast } from 'react-hot-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderOpen },
  { name: 'Files', href: '/dashboard/files', icon: FolderOpen },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Sprints', href: '/dashboard/sprints', icon: Calendar },
  { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const data = await projectAPI.getProjects();
      setProjects(data.slice(0, 5)); // Show only 5 recent projects
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleCreateProject = () => {
    setShowCreateModal(true);
    setSidebarOpen(false); // Close sidebar on mobile
  };

  const handleProjectCreated = (newProject: Project) => {
    setShowCreateModal(false);
    // Add new project to the list
    setProjects([newProject, ...projects.slice(0, 4)]);
    // Redirect to the new project page
    router.push(`/dashboard/projects/${newProject.id}`);
  };

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:flex lg:flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DS</span>
            </div>
            <span className="text-xl font-bold text-gray-900">DevSync</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 mt-6 px-3 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive =
                item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* My Projects Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="px-3 mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">My Projects</h3>
            </div>
            
            {loadingProjects ? (
              <div className="px-3 py-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : projects.length === 0 ? (
              <div className="px-3 py-2">
                <p className="text-xs text-gray-500 text-center">No projects yet</p>
              </div>
            ) : (
              <div className="space-y-1 px-3">
                {projects.map((project) => {
                  const isActive = pathname.startsWith(`/dashboard/projects/${project.id}`);
                  return (
                    <button
                      key={project.id}
                      onClick={() => {
                        router.push(`/dashboard/projects/${project.id}`);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center px-2 py-2 text-sm rounded-lg transition-colors group ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      title={project.name}
                    >
                      <div className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${
                        isActive ? 'bg-blue-600' : 'bg-gray-400 group-hover:bg-gray-600'
                      }`}></div>
                      <span className="truncate text-xs">{project.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
            
            {projects.length > 0 && (
              <div className="px-3 mt-2">
                <button
                  onClick={() => {
                    router.push('/dashboard/projects');
                    setSidebarOpen(false);
                  }}
                  className="w-full text-xs text-blue-600 hover:text-blue-700 text-center py-1"
                >
                  View all projects →
                </button>
              </div>
            )}
          </div>

          {/* New Project Button */}
          <div className="mt-4 px-3 pb-4">
            <Button
              onClick={handleCreateProject}
              className="w-full justify-start"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </nav>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Fixed at top */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumb */}
              <nav className="hidden sm:flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  <li>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Dashboard
                    </button>
                  </li>
                  {pathname !== '/dashboard' && (
                    <>
                      <span className="text-gray-400">/</span>
                      <li className="text-gray-900 font-medium">
                        {pathname.split('/').pop()?.replace('-', ' ') || 'Page'}
                      </li>
                    </>
                  )}
                </ol>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-500 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <Image
                    src={user?.avatar_url || '/default-avatar.png'}
                    alt={user?.name || 'User'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={() => {
                        router.push('/dashboard/settings');
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Settings
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <LogOut className="mr-2 w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <ProjectForm
          onSuccess={handleProjectCreated}
          onCancel={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}