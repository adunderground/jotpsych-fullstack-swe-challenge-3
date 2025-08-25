import React from 'react';

interface TranscriptionCategories {
  primary_interest: string;
  confidence: number;
  subcategories: string[];
  sentiment: string;
  topics: string[];
}

interface CategoryDisplayProps {
  categories: TranscriptionCategories;
}

const CategoryDisplay: React.FC<CategoryDisplayProps> = ({ categories }) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h4 className="font-semibold mb-3 text-blue-700 flex items-center gap-2">
        <span className="text-lg">🤖</span>
        AI Analysis Results
      </h4>
      
      <div className="space-y-3">
        {/* Primary Interest */}
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">Primary Interest:</span>
          <span className="text-blue-800 font-semibold text-lg">
            {categories.primary_interest || 'Unknown'}
          </span>
        </div>
        
        {/* Confidence Score */}
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">Confidence:</span>
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${getConfidenceColor(categories.confidence)}`}>
              {(categories.confidence * 100).toFixed(0)}%
            </span>
            <div className="w-20 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${categories.confidence * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Sentiment */}
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">Sentiment:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSentimentColor(categories.sentiment)}`}>
            {categories.sentiment || 'neutral'}
          </span>
        </div>
        
        {/* Subcategories */}
        {categories.subcategories && categories.subcategories.length > 0 && (
          <div>
            <span className="font-medium text-gray-700 block mb-2">Subcategories:</span>
            <div className="flex flex-wrap gap-2">
              {categories.subcategories.map((cat, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full border border-blue-200"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Related Topics */}
        {categories.topics && categories.topics.length > 0 && (
          <div>
            <span className="font-medium text-gray-700 block mb-2">Related Topics:</span>
            <div className="flex flex-wrap gap-2">
              {categories.topics.map((topic, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full border border-green-200"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDisplay;
