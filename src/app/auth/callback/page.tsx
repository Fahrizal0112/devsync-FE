'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function AuthCallbackPage() {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 p-8">
            <LoadingSpinner size="lg" className="mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-3">
              Processing GitHub Login...
            </h2>
          </div>
        </div>
      </div>
    );
  }
  
  return <AuthCallbackContent />;
}

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasProcessed = useRef(false);
  const { login } = useAuth();

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
          toast.error(`Login failed: ${errorDescription || error}`);
          router.push('/login');
          return;
        }

        if (!code) {
          toast.error('Authentication code not found');
          router.push('/login');
          return;
        }

        // Call the GitHub callback endpoint with the code
        const response = await authAPI.githubCallback(code);
        
        login(response.token, response.user);
        
        toast.success(`Welcome, ${response.user.name || response.user.username}!`);
        
        // Redirect ke dashboard
        router.push('/dashboard');
        
      } catch (error: unknown) {
        console.error('GitHub callback error:', error);
        
        let errorMessage = 'An error occurred while processing GitHub login';
        
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
  }, [searchParams, router, login]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 p-8">
          <LoadingSpinner size="lg" className="mx-auto mb-6" />
          
          <h2 className="text-2xl font-bold text-white mb-3">
            Processing GitHub Login...
          </h2>
          
          <p className="text-gray-400 mb-4">
            Please wait while we complete authentication with GitHub.
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