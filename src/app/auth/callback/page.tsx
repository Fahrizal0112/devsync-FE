'use client';

import React, { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current) return;
    
    const handleCallback = async () => {
      hasProcessed.current = true;
      
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          toast.error(`Login gagal: ${errorDescription || error}`);
          router.push('/login');
          return;
        }

        if (!code) {
          toast.error('Kode autentikasi tidak ditemukan');
          router.push('/login');
          return;
        }

        // Call the GitHub callback endpoint with the code
        const response = await authAPI.githubCallback(code);
        
        // Login with the received token and user data
        login(response.token, response.user);
        
        toast.success(`Selamat datang, ${response.user.name || response.user.username}!`);
        
        // Redirect to dashboard
        router.push('/dashboard');
        
      } catch (error: unknown) {
        console.error('GitHub callback error:', error);
        
        let errorMessage = 'Terjadi kesalahan saat memproses login GitHub';
        
        if (error instanceof Error && 'response' in error && 
            typeof error.response === 'object' && error.response !== null &&
            'data' in error.response && typeof error.response.data === 'object' &&
            error.response.data !== null && 'message' in error.response.data) {
          errorMessage = String(error.response.data.message);
        } else if (error instanceof Error && error.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
        router.push('/login');
      }
    };

    handleCallback();
  }, []); // Remove dependencies to prevent re-execution

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 p-8">
          <LoadingSpinner size="lg" className="mx-auto mb-6" />
          
          <h2 className="text-2xl font-bold text-white mb-3">
            Memproses Login GitHub...
          </h2>
          
          <p className="text-gray-400 mb-4">
            Mohon tunggu sebentar, kami sedang menyelesaikan proses autentikasi dengan GitHub.
          </p>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}