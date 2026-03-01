import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import DOMPurify from "isomorphic-dompurify"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitizes user input by escaping HTML special characters
 * Prevents XSS when displaying user input in the UI
 */
export function sanitizeHtml(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') return '';

  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => htmlEscapes[char] || char);
}

/**
 * Sanitizes HTML content using DOMPurify
 * Use this when rendering HTML with dangerouslySetInnerHTML
 * 
 * DOMPurify is a battle-tested library that removes all dangerous 
 * tags and attributes to prevent XSS attacks.
 */
export function sanitizeHtmlContent(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') return '';

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
  });
}

export const dataGridClassNames =
  "border border-border bg-background shadow text-foreground";

export const dataGridSxStyles = (isDarkMode: boolean) => {
  return {
    "& .MuiDataGrid-columnHeaders": {
      color: `${isDarkMode ? "#e5e7eb" : ""}`,
      '& [role="row"] > *': {
        backgroundColor: `${isDarkMode ? "#1d1f21" : "white"}`,
        borderColor: `${isDarkMode ? "#2d3135" : ""}`,
      },
    },
    "& .MuiIconbutton-root": {
      color: `${isDarkMode ? "#a3a3a3" : ""}`,
    },
    "& .MuiTablePagination-root": {
      color: `${isDarkMode ? "#a3a3a3" : ""}`,
    },
    "& .MuiTablePagination-selectIcon": {
      color: `${isDarkMode ? "#a3a3a3" : ""}`,
    },
    "& .MuiDataGrid-cell": {
      border: "none",
    },
    "& .MuiDataGrid-row": {
      borderBottom: `1px solid ${isDarkMode ? "#2d3135" : "e5e7eb"}`,
    },
    "& .MuiDataGrid-withBorderColor": {
      borderColor: `${isDarkMode ? "#2d3135" : "e5e7eb"}`,
    },
  };
};

/**
 * Check if a task status represents a completed state
 * Supports both "Completed" and "Done" as completed statuses
 */
export function isCompletedStatus(status: string | undefined): boolean {
  return status === "Completed" || status === "Done";
}

/**
 * Check if a task's status matches a column (handles Done/Completed equivalence)
 * For Completed column, includes both "Completed" and "Done"
 */
export function taskMatchesStatusColumn(taskStatus: string | undefined, columnStatus: string): boolean {
  const normalizedTaskStatus = taskStatus || "To Do";
  
  // For Completed column, include both "Completed" and "Done"
  if (columnStatus === "Completed") {
    return isCompletedStatus(normalizedTaskStatus);
  }
  
  // For other columns, exact match
  return normalizedTaskStatus === columnStatus;
}

/**
 * Format a date as a relative time string (e.g., "2 hours ago", "in 3 days")
 * Falls back to a simple string if date-fns is not available
 */
export function formatDistanceToNow(date: Date | number): string {
  const now = new Date();
  const targetDate = typeof date === 'number' ? new Date(date) : date;
  const diffMs = now.getTime() - targetDate.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  
  return targetDate.toLocaleDateString();
}