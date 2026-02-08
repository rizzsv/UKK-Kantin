'use client';

import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SuccessNotificationProps {
  show: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
}

export function SuccessNotification({ 
  show, 
  message, 
  onClose, 
  duration = 3000 
}: SuccessNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-24 right-4 z-[100] animate-slide-in-right">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-100 p-6 min-w-[320px] max-w-md">
        {/* Success Animation Circle */}
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            {/* Animated rings */}
            <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></div>
            <div className="absolute inset-0 rounded-full bg-green-400 animate-pulse opacity-30"></div>
            
            {/* Main icon */}
            <div className="relative w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-7 h-7 text-white animate-scale-in" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Success! 🎉
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-progress"
            style={{ 
              animation: `progress ${duration}ms linear forwards`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
