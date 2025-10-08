'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { projectAPI } from '@/lib/projectApi';
import { File } from '@/types/project';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { FileForm } from '@/components/files/FileForm';
import { FileUploadModal } from '@/components/files/FileUploadModal';
import { DeleteFileModal } from '@/components/files/DeleteFileModal';
import { FileViewer } from '@/components/files/FileViewer';
import { 
  FileText, 
  Plus, 
  Upload, 
  Search, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Download,
  ArrowLeft,
  Folder,
  Code,
  Image,
  FileIcon
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function ProjectFilesPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);
  
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectAPI.getProjectFiles(projectId);
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Gagal memuat files');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileCreated = (newFile: File) => {
    setFiles(prev => [...prev, newFile]);
    setShowCreateModal(false);
    toast.success('File berhasil dibuat!');
  };

  const handleFileUploaded = (uploadedFile: File) => {
    setFiles(prev => [...prev, uploadedFile]);
    setShowUploadModal(false);
    toast.success('File berhasil diupload!');
  };

  const handleFileUpdated = (updatedFile: File) => {
    setFiles(prev => prev.map(file => 
      file.id === updatedFile.id ? updatedFile : file
    ));
    setShowEditModal(false);
    setSelectedFile(null);
    toast.success('File berhasil diperbarui!');
  };

  const handleFileDeleted = () => {
    if (selectedFile) {
      setFiles(prev => prev.filter(file => file.id !== selectedFile.id));
      setShowDeleteModal(false);
      setSelectedFile(null);
      toast.success('File berhasil dihapus!');
    }
  };

  const handleEditFile = (file: File) => {
    setSelectedFile(file);
    setShowEditModal(true);
    setActiveDropdown(null);
  };

  const handleDeleteFile = (file: File) => {
    setSelectedFile(file);
    setShowDeleteModal(true);
    setActiveDropdown(null);
  };

  const handleViewFile = (file: File) => {
    setSelectedFile(file);
    setShowViewModal(true);
    setActiveDropdown(null);
  };

  const handleDownloadFile = (file: File) => {
    if (file.file_url) {
      window.open(file.file_url, '_blank');
    } else {
      toast.error('File tidak memiliki URL download');
    }
    setActiveDropdown(null);
  };

  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (file.mime_type?.startsWith('image/')) {
      return <Image className="w-5 h-5 text-green-500" />;
    }
    
    switch (extension) {
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c':
      case 'go':
      case 'rs':
        return <Code className="w-5 h-5 text-blue-500" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'txt':
      case 'md':
        return <FileText className="w-5 h-5 text-gray-500" />;
      default:
        return <FileIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Project Files</h1>
                <p className="text-gray-600">Kelola files dalam project ini</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Buat File</span>
              </Button>
              <Button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload File</span>
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Files List */}
          <div className="bg-white rounded-lg shadow overflow-visible">
            {filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada files</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery ? 'Tidak ada files yang sesuai dengan pencarian.' : 'Mulai dengan membuat atau mengupload file pertama.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama File
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Path
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ukuran
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dibuat
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFiles.map((file) => (
                      <tr key={file.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getFileIcon(file)}
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {file.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 font-mono">
                            {file.path}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatFileSize(file.file_size)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            {file.file_type || 'code'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(file.created_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="relative">
                            <button
                              onClick={() => setActiveDropdown(activeDropdown === file.id ? null : file.id)}
                              className="text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-100 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            
                            {activeDropdown === file.id && (
                              <>
                                {activeDropdown !== null && (
                                  <>
                                    {/* Backdrop */}
                                    <div 
                                      className="fixed inset-0 z-40" 
                                      onClick={() => setActiveDropdown(null)}
                                    />
                                    
                                    {/* Dropdown Menu */}
                                    <div 
                                      className="fixed bg-white rounded-md shadow-2xl border border-gray-200 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 w-48"
                                      style={{ 
                                        zIndex: 9999,
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)'
                                      }}
                                    >
                                      <div className="py-1">
                                        <button
                                          onClick={() => {
                                            const file = files.find(f => f.id === activeDropdown);
                                            if (file) handleViewFile(file);
                                          }}
                                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 w-full text-left transition-colors duration-150"
                                        >
                                          <Eye className="w-4 h-4 mr-3" />
                                          Lihat File
                                        </button>
                                        <button
                                          onClick={() => {
                                            const file = files.find(f => f.id === activeDropdown);
                                            if (file) handleEditFile(file);
                                          }}
                                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 w-full text-left transition-colors duration-150"
                                        >
                                          <Edit className="w-4 h-4 mr-3" />
                                          Edit File
                                        </button>
                                        {(() => {
                                          const file = files.find(f => f.id === activeDropdown);
                                          return file?.file_url ? (
                                            <button
                                              onClick={() => handleDownloadFile(file)}
                                              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 w-full text-left transition-colors duration-150"
                                            >
                                              <Download className="w-4 h-4 mr-3" />
                                              Download
                                            </button>
                                          ) : null;
                                        })()}
                                      </div>
                                      <div className="py-1">
                                        <button
                                          onClick={() => {
                                            const file = files.find(f => f.id === activeDropdown);
                                            if (file) handleDeleteFile(file);
                                          }}
                                          className="flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 w-full text-left transition-colors duration-150"
                                        >
                                          <Trash2 className="w-4 h-4 mr-3" />
                                          Hapus File
                                        </button>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
          <FileForm
            projectId={projectId}
            onSuccess={handleFileCreated}
            onCancel={() => setShowCreateModal(false)}
          />
        )}

        {showUploadModal && (
          <FileUploadModal
            projectId={projectId}
            onSuccess={handleFileUploaded}
            onCancel={() => setShowUploadModal(false)}
          />
        )}

        {showEditModal && selectedFile && (
          <FileForm
            projectId={projectId}
            file={selectedFile}
            onSuccess={handleFileUpdated}
            onCancel={() => setShowEditModal(false)}
          />
        )}

        {showDeleteModal && selectedFile && (
          <DeleteFileModal
            projectId={projectId}
            file={selectedFile}
            onSuccess={handleFileDeleted}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}

        {showViewModal && selectedFile && (
          <FileViewer
            file={selectedFile}
            onClose={() => setShowViewModal(false)}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}