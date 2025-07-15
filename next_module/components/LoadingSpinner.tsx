/**
 * LoadingSpinner Component
 * 
 * A reusable loading indicator with consistent styling
 */

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'small' | 'medium' | 'large';
  /** Optional className for wrapper div */
  className?: string;
  /** Accessible label for screen readers */
  label?: string;
}

/**
 * Renders an animated loading spinner
 */
export default function LoadingSpinner({ 
  size = 'medium', 
  className = '',
  label = 'Loading...'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16',
  };

  return (
    <div className={`flex justify-center items-center p-8 ${className}`}>
      <div 
        className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]}`}
        role="status"
        aria-label={label}
      >
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}