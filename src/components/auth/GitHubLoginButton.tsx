'use client';

import React from 'react';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { authAPI } from '@/lib/api';

export const GitHubLoginButton: React.FC = () => {
  const handleGitHubLogin = () => {
    authAPI.githubLogin();
  };

  return (
    <Button
      onClick={handleGitHubLogin}
      variant="github"
      size="lg"
      className="w-full flex items-center justify-center gap-3 text-base font-semibold py-4"
    >
      <Github size={20} />
      Login with GitHub
    </Button>
  );
};