import { formatDistanceToNow as dateFnsFormatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format a date to a relative time string (e.g., "2 hours ago", "3 days ago")
 */
export function formatDistanceToNow(date: string | Date | number): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : 
                    typeof date === 'number' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Unknown date';
    }
    
    return dateFnsFormatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    return 'Unknown date';
  }
}

/**
 * Format a date to a localized string
 */
export function formatDate(date: string | Date | number, options?: Intl.DateTimeFormatOptions): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : 
                    typeof date === 'number' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return dateObj.toLocaleDateString(undefined, options || {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Format a date to a localized datetime string
 */
export function formatDateTime(date: string | Date | number): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : 
                    typeof date === 'number' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return dateObj.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return 'Invalid date';
  }
}
