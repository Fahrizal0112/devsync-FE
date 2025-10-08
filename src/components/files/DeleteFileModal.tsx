'use client';

import React, { useState } from 'react';
import { File } from '@/types/project';
import { projectAPI } from '@/lib/projectApi';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DeleteFileModalProps {
  projectId: number;
  file: File;
  onSuccess: () => void;
  onCancel: () => void;
}

export const DeleteFileModal: React.FC<DeleteFileModalProps> = ({
  projectId,
  file,
  onSuccess,
  onCancel
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await projectAPI.deleteFile(projectId, file.id);
      toast.success('File berhasil dihapus!');
      onSuccess();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Gagal menghapus file');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Hapus File"
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-900">
              Apakah Anda yakin ingin menghapus file <strong>{file.name}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button
            onClick={handleDelete}
            loading={isDeleting}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Hapus File
          </Button>
        </div>
      </div>
    </Modal>
  );
};