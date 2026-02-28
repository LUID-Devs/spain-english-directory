<<<<<<< HEAD
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
=======
/**
 * Date utility functions for formatting and displaying dates
 */

/**
 * Format a date as a relative time string (e.g., "2 hours ago", "3 days ago")
 */
export function formatDistanceToNow(date: string | Date): string {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }
  
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`;
  }
  
  return `${diffInYears}y ago`;
}

/**
 * Format a date as a localized string
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  return targetDate.toLocaleDateString(undefined, defaultOptions);
}

/**
 * Format a date with time
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Check if a date is today
 */
export function isToday(date: string | Date): boolean {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    targetDate.getDate() === today.getDate() &&
    targetDate.getMonth() === today.getMonth() &&
    targetDate.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is in the past
 */
export function isPast(date: string | Date): boolean {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  return targetDate.getTime() < Date.now();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: string | Date): boolean {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  return targetDate.getTime() > Date.now();
>>>>>>> a26c717607dc8683acab4df6ccbd0e195737fad4
}
