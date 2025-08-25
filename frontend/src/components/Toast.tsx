import React from 'react';

interface ToastProps {
  message: string;
  type: 'warning' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'warning':
        return 'Warning!';
      case 'error':
        return 'Error';
    }
  };

  return (
    <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50" style={{ maxWidth: '400px' }}>
      <div className={`border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm max-w-xs ${getToastStyles()}`}>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                {getTypeLabel()}
              </span>
            </div>
            <p className="text-xs text-gray-700">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
