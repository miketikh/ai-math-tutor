'use client';

import React, { useEffect, useState } from 'react';

/**
 * Props for the LoadingIndicator component
 */
export interface LoadingIndicatorProps {
  /** The main message to display (default: "AI is thinking...") */
  message?: string;
  /** Whether to show timeout warning after delay */
  showTimeout?: boolean;
  /** Timeout duration in milliseconds (default: 10000ms = 10 seconds) */
  timeoutDuration?: number;
  /** Custom timeout message */
  timeoutMessage?: string;
  /** Optional: Additional CSS classes */
  className?: string;
}

/**
 * LoadingIndicator Component
 *
 * Professional loading indicator with animated dots and optional timeout warning.
 *
 * Features:
 * - Animated bouncing dots
 * - Customizable message
 * - Optional 10-second timeout warning
 * - Dark mode support
 * - Smooth animations
 * - Accessible
 *
 * Usage:
 * ```tsx
 * <LoadingIndicator />
 * <LoadingIndicator message="Loading..." />
 * <LoadingIndicator showTimeout={true} />
 * <LoadingIndicator
 *   message="Processing..."
 *   showTimeout={true}
 *   timeoutDuration={15000}
 *   timeoutMessage="Still processing..."
 * />
 * ```
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'AI is thinking...',
  showTimeout = false,
  timeoutDuration = 10000,
  timeoutMessage = 'This is taking longer than expected. The AI is still working on your response...',
  className = '',
}) => {
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  /**
   * Handle timeout logic
   */
  useEffect(() => {
    if (!showTimeout) {
      return;
    }

    const timer = setTimeout(() => {
      setShowTimeoutWarning(true);
    }, timeoutDuration);

    return () => {
      clearTimeout(timer);
      setShowTimeoutWarning(false);
    };
  }, [showTimeout, timeoutDuration]);

  return (
    <div
      className={`bg-gray-50 dark:bg-gray-800 shadow-lg px-4 py-3 border-t border-gray-200 dark:border-gray-700 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-3">
        {/* Animated Dots */}
        <div className="flex space-x-1" aria-hidden="true">
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>

        {/* Message Container */}
        <div className="flex flex-col">
          {/* Main Message */}
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {message}
          </span>

          {/* Timeout Warning */}
          {showTimeout && showTimeoutWarning && (
            <span className="text-xs text-amber-600 dark:text-amber-400 mt-1 animate-pulse">
              {timeoutMessage}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Display name for debugging
LoadingIndicator.displayName = 'LoadingIndicator';

export default LoadingIndicator;
