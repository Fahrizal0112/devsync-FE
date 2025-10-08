'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const devLoginSchema = z.object({
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh mengandung huruf, angka, dan underscore'),
  email: z
    .string()
    .email('Format email tidak valid')
    .min(1, 'Email wajib diisi'),
});

type DevLoginFormData = z.infer<typeof devLoginSchema>;

interface DevLoginFormProps {
  isVisible: boolean;
}

export const DevLoginForm: React.FC<DevLoginFormProps> = ({ isVisible }) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<DevLoginFormData>({
    resolver: zodResolver(devLoginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: DevLoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.devLogin(data);
      login(response.token, response.user);
      toast.success('Login berhasil!');
      // Redirect will be handled by the auth context
    } catch (error: unknown) {
      console.error('Dev login error:', error);
      const errorMessage = error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && error.response !== null &&
        'data' in error.response && typeof error.response.data === 'object' &&
        error.response.data !== null && 'message' in error.response.data
        ? String(error.response.data.message)
        : 'Login gagal. Silakan coba lagi.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="mt-6 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">Development Mode</h3>
        <p className="text-sm text-gray-400">
          Login cepat untuk development dan testing
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Username"
          placeholder="Masukkan username"
          error={errors.username?.message}
          {...register('username')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="Masukkan email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Button
          type="submit"
          variant="secondary"
          size="lg"
          loading={isLoading}
          disabled={!isValid || isLoading}
          className="w-full"
        >
          Login as Developer
        </Button>
      </form>

      <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
        <p className="text-xs text-yellow-300">
          ⚠️ Mode development hanya untuk testing. Gunakan GitHub login untuk fitur lengkap.
        </p>
      </div>
    </div>
  );
};