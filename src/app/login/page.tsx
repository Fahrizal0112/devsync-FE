'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Code2, Users, Zap } from 'lucide-react';
import { GitHubLoginButton } from '@/components/auth/GitHubLoginButton';
import { DevLoginForm } from '@/components/auth/DevLoginForm';

export default function LoginPage() {
  const [showDevLogin, setShowDevLogin] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Code2 size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">DevSync</h1>
          <p className="text-gray-400 text-sm">
            Empowering Collaborative Software Development
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 p-8">
          {/* GitHub Login */}
          <div className="mb-6">
            <GitHubLoginButton />
            <p className="text-xs text-center text-gray-400 mt-2">
              Recommended for full features and seamless experience
            </p>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-800 text-gray-400">OR</span>
            </div>
          </div>

          {/* Dev Login Toggle */}
          <button
            onClick={() => setShowDevLogin(!showDevLogin)}
            className="w-full flex items-center justify-between p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-all duration-200 border border-gray-600 hover:border-gray-500"
          >
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-yellow-400" />
              <span className="text-white font-medium">Development Login</span>
            </div>
            {showDevLogin ? (
              <ChevronUp size={16} className="text-gray-400" />
            ) : (
              <ChevronDown size={16} className="text-gray-400" />
            )}
          </button>

          {/* Dev Login Form */}
          <DevLoginForm isVisible={showDevLogin} />
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-3">
            <Users size={20} className="text-blue-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Team Collaboration</p>
          </div>
          <div className="p-3">
            <Code2 size={20} className="text-green-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Code Management</p>
          </div>
          <div className="p-3">
            <Zap size={20} className="text-yellow-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Fast Development</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            © 2024 DevSync. All rights reserved.
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="#" className="text-xs text-gray-400 hover:text-gray-300 transition-colors">
              Documentation
            </a>
            <a href="#" className="text-xs text-gray-400 hover:text-gray-300 transition-colors">
              Help
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}