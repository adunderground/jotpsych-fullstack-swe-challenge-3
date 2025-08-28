"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={cn("text-center py-8 text-sm text-gray-600", className)}>
      <p>
        Made with 🤖 by{' '}
        <a 
          href="https://github.com/adunderground" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-cta hover:text-cta/80 transition-colors duration-200 font-medium"
        >
          ad_underground
        </a>
      </p>
    </footer>
  );
};
