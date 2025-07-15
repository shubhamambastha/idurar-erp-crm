/**
 * Utility functions for formatting data
 */

/**
 * Format a date string to a localized date
 * @param dateString - ISO date string
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted date string
 */
export function formatDate(dateString: string, locale: string = 'en-US'): string {
  try {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format a date string to relative time (e.g., "2 hours ago")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return formatDate(dateString);
  } catch {
    return 'Invalid date';
  }
}

/**
 * Truncate text to a maximum length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Format project ID for display
 * @param projectId - Raw project ID
 * @returns Formatted project ID
 */
export function formatProjectId(projectId: string): string {
  // Extract the numeric timestamp part if present
  const match = projectId.match(/PRJ-(\d+)-/);
  if (match) {
    const timestamp = match[1];
    const shortId = projectId.split('-').pop()?.substring(0, 6).toUpperCase();
    return `PRJ-${shortId}`;
  }
  return projectId;
}