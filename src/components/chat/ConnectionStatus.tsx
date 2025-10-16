'use client';

import React, { useState, useEffect } from 'react';

interface ConnectionStatusProps {
  isConnected: boolean;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  showText = true,
  size = 'md',
  className = ''
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastConnectionState, setLastConnectionState] = useState(isConnected);

  // Animate when connection state changes
  useEffect(() => {
    if (lastConnectionState !== isConnected) {
      setIsAnimating(true);
      setLastConnectionState(isConnected);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, lastConnectionState]);

  const sizeClasses = {
    sm: {
      dot: 'w-2 h-2',
      text: 'text-xs',
      container: 'space-x-1'
    },
    md: {
      dot: 'w-3 h-3',
      text: 'text-sm',
      container: 'space-x-2'
    },
    lg: {
      dot: 'w-4 h-4',
      text: 'text-base',
      container: 'space-x-2'
    }
  };

  const currentSize = sizeClasses[size];

  const getStatusColor = () => {
    if (isConnected) {
      return 'bg-green-500';
    }
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (isConnected) {
      return 'Connected';
    }
    return 'Disconnected';
  };

  const getPulseAnimation = () => {
    if (isAnimating) {
      return 'animate-pulse';
    }
    if (isConnected) {
      return 'animate-pulse';
    }
    return '';
  };

  return (
    <div className={`flex items-center ${currentSize.container} ${className}`}>
      {/* Status indicator dot */}
      <div className="relative">
        <div
          className={`${currentSize.dot} rounded-full ${getStatusColor()} ${getPulseAnimation()}`}
        />
        
        {/* Ripple effect for connected state */}
        {isConnected && (
          <div
            className={`absolute inset-0 ${currentSize.dot} rounded-full bg-green-400 animate-ping opacity-75`}
          />
        )}
      </div>

      {/* Status text */}
      {showText && (
        <span
          className={`${currentSize.text} font-medium transition-colors duration-300 ${
            isConnected ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {getStatusText()}
        </span>
      )}

      {/* Connection quality indicator (optional) */}
      {isConnected && (
        <div className="flex space-x-0.5">
          <div className="w-1 h-2 bg-green-500 rounded-full" />
          <div className="w-1 h-3 bg-green-500 rounded-full" />
          <div className="w-1 h-2 bg-green-500 rounded-full" />
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;