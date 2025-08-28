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
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({
  onPause,
  onStop,
  onAddRecording,
  isRecording = false,
  isPaused = false,
  className
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
      
      <ControlButton 
        onClick={onAddRecording || (() => {})}
        disabled={!onAddRecording}
        variant="primary"
      >
        + Add Recording
      </ControlButton>
    </div>
  );
};
