'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ChatContainer } from '@/components/chat';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { projectAPI } from '@/lib/projectApi';
import { Project, File, Task, ChatFilter } from '@/types/project';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { 
  MessageCircle, 
  FileText, 
  CheckSquare, 
  ArrowLeft,
  Filter,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

type ChatMode = 'project' | 'file' | 'task';

export default function ProjectChatPage() {
  const params = useParams();
  const projectId = parseInt(params.id as string);
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatMode, setChatMode] = useState<ChatMode>('project');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const projectData = await projectAPI.getProject(projectId);
        setProject(projectData);
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('Gagal memuat detail project');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const getChatFilter = (): ChatFilter | undefined => {
    if (chatMode === 'file' && selectedFile) {
      return { file_id: selectedFile.id };
    }
    if (chatMode === 'task' && selectedTask) {
      return { task_id: selectedTask.id };
    }
    return undefined;
  };

  const handleModeChange = (mode: ChatMode) => {
    setChatMode(mode);
    setSelectedFile(null);
    setSelectedTask(null);
    setShowFilters(false);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setChatMode('file');
    setShowFilters(false);
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setChatMode('task');
    setShowFilters(false);
  };

  const clearFilter = () => {
    setChatMode('project');
    setSelectedFile(null);
    setSelectedTask(null);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-full">
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
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500">Project tidak ditemukan</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <WebSocketProvider projectId={projectId}>
        <DashboardLayout>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.history.back()}
                    className="p-2"
                  >
                    <ArrowLeft size={16} />
                  </Button>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                      Chat - {project.name}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {chatMode === 'project' && 'Diskusi umum project'}
                      {chatMode === 'file' && selectedFile && `Diskusi file: ${selectedFile.name}`}
                      {chatMode === 'task' && selectedTask && `Diskusi task: ${selectedTask.title}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Filter Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2"
                  >
                    <Filter size={16} />
                    <span>Filter</span>
                  </Button>

                  {/* Clear Filter */}
                  {(selectedFile || selectedTask) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilter}
                      className="flex items-center space-x-2"
                    >
                      <X size={16} />
                      <span>Clear</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Chat Mode Buttons */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Mode Chat</h3>
                      <div className="space-y-2">
                        <Button
                          variant={chatMode === 'project' ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => handleModeChange('project')}
                          className="w-full justify-start"
                        >
                          <MessageCircle size={16} className="mr-2" />
                          Project
                        </Button>
                        <Button
                          variant={chatMode === 'file' ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => handleModeChange('file')}
                          className="w-full justify-start"
                        >
                          <FileText size={16} className="mr-2" />
                          File
                        </Button>
                        <Button
                          variant={chatMode === 'task' ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => handleModeChange('task')}
                          className="w-full justify-start"
                        >
                          <CheckSquare size={16} className="mr-2" />
                          Task
                        </Button>
                      </div>
                    </div>

                    {/* File Selection */}
                    {chatMode === 'file' && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Pilih File</h3>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {project.files?.map((file) => (
                            <button
                              key={file.id}
                              onClick={() => handleFileSelect(file)}
                              className={`
                                w-full text-left px-3 py-2 text-sm rounded-md transition-colors
                                ${selectedFile?.id === file.id 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'hover:bg-gray-100'
                                }
                              `}
                            >
                              <div className="truncate">{file.name}</div>
                              <div className="text-xs text-gray-500 truncate">{file.path}</div>
                            </button>
                          )) || (
                            <p className="text-sm text-gray-500">Tidak ada file</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Task Selection */}
                    {chatMode === 'task' && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Pilih Task</h3>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {project.tasks?.map((task) => (
                            <button
                              key={task.id}
                              onClick={() => handleTaskSelect(task)}
                              className={`
                                w-full text-left px-3 py-2 text-sm rounded-md transition-colors
                                ${selectedTask?.id === task.id 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'hover:bg-gray-100'
                                }
                              `}
                            >
                              <div className="truncate">{task.title}</div>
                              <div className="text-xs text-gray-500">
                                {task.status} • {task.priority}
                              </div>
                            </button>
                          )) || (
                            <p className="text-sm text-gray-500">Tidak ada task</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Chat Container */}
            <div className="flex-1 overflow-hidden">
              <ErrorBoundary
                fallback={({ resetError }) => (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Chat Error
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Terjadi kesalahan saat memuat chat. Silakan coba lagi.
                      </p>
                      <Button onClick={resetError}>
                        Coba Lagi
                      </Button>
                    </div>
                  </div>
                )}
              >
                <ChatContainer
                  projectId={projectId}
                  filter={getChatFilter()}
                  className="h-full"
                />
              </ErrorBoundary>
            </div>
          </div>
        </DashboardLayout>
      </WebSocketProvider>
    </ProtectedRoute>
  );
}