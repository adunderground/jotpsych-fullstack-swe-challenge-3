"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnalysisCardProps {
  title: string;
  content: string;
  categories?: {
    primary_interest: string;
    confidence: number;
    subcategories: string[];
    sentiment: string;
    topics: string[];
  };
  className?: string;
  defaultExpanded?: boolean;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({
  title,
  content,
  categories,
  className,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={cn(
      "bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden",
      "hover:shadow-md transition-shadow duration-200",
      className
    )}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-gray-50"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-500"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.293 5.293a1 1 0 011.414 0L8 7.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
            </svg>
          </motion.div>
        </div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-4 pb-4 border-t border-gray-100">
              {/* Transcription Content */}
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Transcription:</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{content}</p>
              </div>

              {/* Categories Display */}
              {categories && (
                <div className="mt-4 space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">AI Analysis:</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="font-medium text-gray-600">Primary Interest:</span>
                      <p className="text-gray-800">{categories.primary_interest}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-600">Confidence:</span>
                      <p className="text-gray-800">{(categories.confidence * 100).toFixed(1)}%</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-600">Sentiment:</span>
                      <p className="text-gray-800 capitalize">{categories.sentiment}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-600">Topics:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {categories.topics.map((topic, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-accent-light/30 text-gray-700 rounded text-xs"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {categories.subcategories.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-600 text-xs">Subcategories:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {categories.subcategories.map((subcategory, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-cta/10 text-gray-700 rounded text-xs"
                          >
                            {subcategory}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
