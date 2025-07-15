/**
 * ErrorMessage Component
 * 
 * Displays error messages in a consistent format
 */

interface ErrorMessageProps {
  /** Error message to display */
  message: string;
  /** Optional title for the error */
  title?: string;
  /** Optional retry callback */
  onRetry?: () => void;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * Renders an error message with optional retry action
 */
export default function ErrorMessage({
  message,
  title = 'Error',
  onRetry,
  className = '',
}: ErrorMessageProps) {
  return (
    <div 
      className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <svg 
            className="h-5 w-5 text-red-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {title}
          </h3>
          <p className="mt-1 text-sm text-red-700">
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-red-800 hover:text-red-900 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}