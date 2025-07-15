/**
 * StatusBadge Component
 * 
 * Displays a colored badge indicating the project status
 * Uses consistent color scheme across the application
 */

import { ProjectStatus } from '@/types/project';
import { PROJECT_STATUS_CONFIG } from '@/utils/constants';

interface StatusBadgeProps {
  /** The status to display */
  status: ProjectStatus;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * Renders a status badge with appropriate colors and text
 */
export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = PROJECT_STATUS_CONFIG[status];
  
  if (!config) {
    // Fallback for unknown status
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-100 text-gray-800 border-gray-200 ${className}`}>
        {status}
      </span>
    );
  }

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bgColor} ${config.color} ${config.borderColor} ${className}`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </span>
  );
}