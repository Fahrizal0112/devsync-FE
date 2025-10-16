'use client';

import React, { useState } from 'react';
import { Project } from '@/types/project';
import { projectAPI } from '@/lib/projectApi';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';

interface DeleteProjectModalProps {
  project: Project;
  onSuccess: () => void;
  onCancel: () => void;
}

export const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  project,
  onSuccess,
  onCancel
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!project) return;

    setIsDeleting(true);
    try {
      await projectAPI.deleteProject(project.id);
      toast.success('Project berhasil dihapus!');
      onSuccess();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Gagal menghapus project');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Hapus Project"
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Konfirmasi Penghapusan
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Apakah Anda yakin ingin menghapus project <strong>&quot;{project.name}&quot;</strong>?
              Tindakan ini tidak dapat dibatalkan dan semua data terkait akan hilang.
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
            type="button"
            variant="secondary"
            onClick={handleDelete}
            loading={isDeleting}
            disabled={isDeleting}
          >
            Hapus Project
          </Button>
        </div>
      </div>
    </Modal>
  );
};