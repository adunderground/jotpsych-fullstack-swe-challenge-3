"use client";

import React from 'react';
import { RippleEffect } from './ripple-effect';
import { cn } from '@/lib/utils';

interface RecordButtonProps {
  isRecording: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const RecordButton: React.FC<RecordButtonProps> = ({
  isRecording,
  onClick,
  disabled = false,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <RippleEffect 
        rippleColor="rgba(239, 68, 68, 0.3)"
        rippleDuration={800}
        disabled={disabled}
      >
        <button
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "relative w-20 h-20 rounded-full transition-all duration-300 ease-out",
            "shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-red-500/30",
            "transform hover:scale-105 active:scale-95",
            isRecording 
              ? "bg-red-600 hover:bg-red-700 animate-pulse" 
              : "bg-red-500 hover:bg-red-600",
            disabled && "opacity-50 cursor-not-allowed hover:scale-100"
          )}
        >
          {/* Outer ring for recording state */}
          {isRecording && (
            <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping" />
          )}
          
          {/* Inner circle */}
          <div className={cn(
            "absolute inset-3 rounded-full transition-all duration-300",
            isRecording 
              ? "bg-red-700 transform scale-75" 
              : "bg-red-600"
          )} />
          
          {/* Recording indicator dot */}
          {isRecording && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-pulse" />
          )}
        </button>
      </RippleEffect>
    </div>
  );
};
