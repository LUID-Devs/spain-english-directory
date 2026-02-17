/**
 * HTML Escape Utility
 * Prevents XSS by escaping HTML special characters in user-generated content
 */

const htmlEscapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escapes HTML special characters to prevent XSS attacks
 * Use when displaying any user-generated content
 */
export function escapeHtml(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/[&<>"'\/]/g, (char) => htmlEscapes[char] || char);
}

/**
 * Escapes HTML in all string properties of an object (shallow)
 */
export function escapeHtmlInObject<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  for (const key in result) {
    if (typeof result[key] === 'string') {
      result[key] = escapeHtml(result[key]) as any;
    }
  }
  return result;
}