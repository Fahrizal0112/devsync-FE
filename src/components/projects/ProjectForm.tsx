'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Project } from '@/types/project';
import { projectAPI } from '@/lib/projectApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';

const projectSchema = z.object({
  name: z.string().min(1, 'Nama project wajib diisi').max(100, 'Nama project maksimal 100 karakter'),
  description: z.string().min(1, 'Deskripsi wajib diisi').max(500, 'Deskripsi maksimal 500 karakter'),
  github_repo: z.string().optional(),
  is_public: z.boolean(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: Project | null;
  onSuccess: (project: Project) => void;
  onCancel: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSuccess,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!project;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      github_repo: '',
      is_public: false,
    }
  });

  useEffect(() => {
    if (project) {
      setValue('name', project.name);
      setValue('description', project.description);
      setValue('github_repo', project.github_repo || '');
      setValue('is_public', project.is_public);
    } else {
      reset();
    }
  }, [project, setValue, reset]);

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      let result: Project;
      
      if (isEditing && project) {
        result = await projectAPI.updateProject(project.id, data);
        toast.success('Project berhasil diperbarui!');
      } else {
        result = await projectAPI.createProject(data);
        toast.success('Project berhasil dibuat!');
      }
      
      onSuccess(result);
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error(isEditing ? 'Gagal memperbarui project' : 'Gagal membuat project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={isEditing ? 'Edit Project' : 'Buat Project Baru'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Nama Project"
          {...register('name')}
          error={errors.name?.message}
          placeholder="Masukkan nama project"
        />

        <Textarea
          label="Deskripsi"
          {...register('description')}
          error={errors.description?.message}
          placeholder="Masukkan deskripsi project"
          rows={4}
        />

        <Input
          label="GitHub Repository (Opsional)"
          {...register('github_repo')}
          error={errors.github_repo?.message}
          placeholder="https://github.com/username/repository"
        />

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="is_public"
            {...register('is_public')}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label htmlFor="is_public" className="text-sm font-medium text-gray-700">
            Project Public (dapat dilihat oleh semua orang)
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEditing ? 'Perbarui' : 'Buat'} Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};