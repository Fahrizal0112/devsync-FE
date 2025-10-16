'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, RefreshCw, Server } from 'lucide-react';
import { Button } from './Button';
import api from '@/lib/api';

interface BackendStatusProps {
  className?: string;
}

export const BackendStatus: React.FC<BackendStatusProps> = ({ className = '' }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkBackendStatus = async () => {
    setIsChecking(true);
    try {
      // Try to make a simple request to check if backend is running
      // Using projects endpoint which should exist and be accessible
      await api.get('/projects');
      setIsConnected(true);
    } catch (error) {
      console.log('Backend connection check failed:', error);
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkBackendStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isConnected === true) {
    return (
      <div className={`flex items-center space-x-2 text-green-600 ${className}`}>
        <CheckCircle size={16} />
        <span className="text-sm">Backend terhubung</span>
      </div>
    );
  }

  if (isConnected === false) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-red-500 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="text-red-800 font-medium text-sm">Backend Server Tidak Terhubung</h3>
            <p className="text-red-700 text-sm mt-1">
              Aplikasi membutuhkan backend server untuk berfungsi dengan baik.
            </p>
            <div className="mt-3 space-y-2">
              <p className="text-red-600 text-xs">
                <strong>Langkah-langkah:</strong>
              </p>
              <ol className="text-red-600 text-xs space-y-1 ml-4 list-decimal">
                <li>Pastikan backend server berjalan di <code className="bg-red-100 px-1 rounded">http://localhost:8080</code></li>
                <li>Periksa apakah port 8080 tidak digunakan aplikasi lain</li>
                <li>Restart backend server jika diperlukan</li>
              </ol>
            </div>
            <div className="mt-3 flex space-x-2">
              <Button
                onClick={checkBackendStatus}
                disabled={isChecking}
                size="sm"
                variant="outline"
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                {isChecking ? (
                  <>
                    <RefreshCw size={14} className="animate-spin mr-1" />
                    Memeriksa...
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} className="mr-1" />
                    Coba Lagi
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className={`flex items-center space-x-2 text-gray-500 ${className}`}>
      <Server size={16} />
      <span className="text-sm">Memeriksa koneksi backend...</span>
    </div>
  );
};