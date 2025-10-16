'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { File } from '@/types/project';
import { projectAPI } from '@/lib/projectApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';

const fileSchema = z.object({
  name: z.string().min(1, 'Nama file wajib diisi').max(255, 'Nama file maksimal 255 karakter'),
  path: z.string().min(1, 'Path file wajib diisi').max(500, 'Path file maksimal 500 karakter'),
  content: z.string().min(1, 'Konten file wajib diisi'),
});

type FileFormData = z.infer<typeof fileSchema>;

interface FileFormProps {
  projectId: number;
  file?: File | null;
  onSuccess: (file: File) => void;
  onCancel: () => void;
}

export const FileForm: React.FC<FileFormProps> = ({
  projectId,
  file,
  onSuccess,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!file;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<FileFormData>({
    resolver: zodResolver(fileSchema),
    defaultValues: {
      name: '',
      path: '',
      content: '',
    }
  });

  useEffect(() => {
    if (file) {
      setValue('name', file.name);
      setValue('path', file.path);
      setValue('content', file.content || '');
    } else {
      reset();
    }
  }, [file, setValue, reset]);

  const onSubmit = async (data: FileFormData) => {
    setIsSubmitting(true);
    try {
      let result: File;
      
      if (isEditing && file) {
        result = await projectAPI.updateFile(projectId, file.id, data);
        toast.success('File berhasil diperbarui!');
      } else {
        result = await projectAPI.createFile(projectId, data);
        toast.success('File berhasil dibuat!');
      }
      
      onSuccess(result);
    } catch (error) {
      console.error('Error saving file:', error);
      toast.error(isEditing ? 'Gagal memperbarui file' : 'Gagal membuat file');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={isEditing ? 'Edit File' : 'Buat File Baru'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Nama File"
          {...register('name')}
          error={errors.name?.message}
          placeholder="contoh: main.go, index.html"
        />

        <Input
          label="Path File"
          {...register('path')}
          error={errors.path?.message}
          placeholder="contoh: /src/main.go, /public/index.html"
        />

        <Textarea
          label="Konten File"
          {...register('content')}
          error={errors.content?.message}
          placeholder="Masukkan konten file..."
          rows={12}
          className="font-mono text-sm"
        />

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
            {isEditing ? 'Perbarui' : 'Buat'} File
          </Button>
        </div>
      </form>
    </Modal>
  );
};