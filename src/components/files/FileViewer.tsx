'use client';

import React from 'react';
import Image from 'next/image';
import { File } from '@/types/project';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Download, ExternalLink } from 'lucide-react';

interface FileViewerProps {
  file: File;
  onClose: () => void;
}

export const FileViewer: React.FC<FileViewerProps> = ({
  file,
  onClose
}) => {
  const handleDownload = () => {
    if (file.file_url) {
      window.open(file.file_url, '_blank');
    }
  };

  const renderFileContent = () => {
    // If it's a code file with content
    if (file.content && !file.file_url) {
      return (
        <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
          <pre className="text-sm font-mono whitespace-pre-wrap">
            {file.content}
          </pre>
        </div>
      );
    }

    // If it's an image
    if (file.mime_type?.startsWith('image/') && file.file_url) {
      return (
        <div className="text-center">
          <Image
            src={file.file_url}
            alt={file.name}
            width={800}
            height={600}
            className="max-w-full max-h-96 mx-auto rounded-lg object-contain"
          />
        </div>
      );
    }

    // If it's a PDF or other file with URL
    if (file.file_url) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            This file can be downloaded or opened in a new tab
          </p>
          <div className="space-x-3">
            <Button
              onClick={handleDownload}
              className="inline-flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(file.file_url, '_blank')}
              className="inline-flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in New Tab</span>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Cannot display a preview for this file</p>
      </div>
    );
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
      onClose={onClose}
      title={file.name}
      size="xl"
    >
      <div className="space-y-4">
        {/* File Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Path:</span>
              <span className="ml-2 font-mono text-gray-600">{file.path}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Size:</span>
              <span className="ml-2 text-gray-600">{formatFileSize(file.file_size)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Type:</span>
              <span className="ml-2 text-gray-600">{file.file_type || 'code'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <span className="ml-2 text-gray-600">
                {new Date(file.created_at).toLocaleDateString('en-US')}
              </span>
            </div>
          </div>
        </div>

        {/* File Content */}
        {renderFileContent()}

        {/* Actions */}
        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};