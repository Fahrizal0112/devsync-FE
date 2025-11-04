'use client';

import React, { useState, useRef } from 'react';
import { File as ProjectFile } from '@/types/project';
import { projectAPI } from '@/lib/projectApi';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Upload, X, FileIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FileUploadModalProps {
  projectId: number;
  onSuccess: (file: ProjectFile) => void;
  onCancel: () => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  projectId,
  onSuccess,
  onCancel
}) => {
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: globalThis.File) => {
    setSelectedFile(file);
    
    // Auto-detect file type based on mime type
    if (file.type.startsWith('image/')) {
      setFileType('images');
    } else if (file.type === 'application/pdf' || file.type.includes('document')) {
      setFileType('documents');
    } else {
      setFileType('code');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    try {
      const result = await projectAPI.uploadFile(projectId, selectedFile, fileType);
      toast.success('File uploaded successfully!');
      onSuccess(result);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Upload File"
      size="md"
    >
      <div className="space-y-6">
        {/* File Drop Zone */}
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          {selectedFile ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-3">
                <FileIcon className="w-8 h-8 text-blue-500" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                    Click to choose a file
                  </span>
                  {' '}or drag & drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports all file types
                </p>
              </div>
            </div>
          )}
        </div>

        {/* File Type Selection */}
        {selectedFile && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Type
            </label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="code">Code</option>
              <option value="documents">Documents</option>
              <option value="images">Images</option>
              <option value="assets">Assets</option>
            </select>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            loading={isUploading}
            disabled={isUploading || !selectedFile}
          >
            Upload File
          </Button>
        </div>
      </div>
    </Modal>
  );
};