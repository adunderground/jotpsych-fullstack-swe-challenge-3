"use client";

import React from 'react';
import { RippleEffect } from './ripple-effect';
import { cn } from '@/lib/utils';

interface ControlButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

const ControlButton: React.FC<ControlButtonProps> = ({
  onClick,
  disabled = false,
  className,
  children,
  variant = 'secondary'
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantStyles = {
    primary: "bg-cta hover:bg-cta/90 text-white focus:ring-cta/50",
    secondary: "bg-accent-light hover:bg-accent-light/80 text-text-primary focus:ring-accent-light/50",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500/50"
  };

  return (
    <RippleEffect rippleColor="rgba(255, 255, 255, 0.2)">
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          baseStyles,
          variantStyles[variant],
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {children}
      </button>
    </RippleEffect>
  );
};

interface ControlButtonsProps {
  onPause?: () => void;
  onStop?: () => void;
  onAddRecording?: () => void;
  isRecording?: boolean;
  isPaused?: boolean;
  className?: string;
  showParallelButton?: boolean;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({
  onPause,
  onStop,
  onAddRecording,
  isRecording = false,
  isPaused = false,
  className,
  showParallelButton = true
}) => {
  return (
    <div className={cn("flex gap-3 justify-center", className)}>
      {isRecording && (
        <>
          <ControlButton 
            onClick={onPause || (() => {})}
            disabled={!onPause}
            variant="secondary"
          >
            {isPaused ? "Resume" : "Pause"}
          </ControlButton>
          
          <ControlButton 
            onClick={onStop || (() => {})}
            disabled={!onStop}
            variant="danger"
          >
            Stop
          </ControlButton>
        </>
      )}
      
      {showParallelButton && (
        <div className="relative group">
          <ControlButton 
            onClick={onAddRecording || (() => {})}
            disabled={!onAddRecording}
            variant="primary"
          >
            🎙️ Record in Parallel
          </ControlButton>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            Record multiple audios simultaneously
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};
