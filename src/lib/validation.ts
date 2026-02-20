/**
 * Validation utilities for preventing visual spoofing attacks
 * via zero-width Unicode characters and DOS attacks via Cuneiform characters
 */

// Zero-width Unicode characters that can be used for visual spoofing
const ZERO_WIDTH_CHARS = [
  '\u200B', // Zero Width Space
  '\u200C', // Zero Width Non-Joiner
  '\u200D', // Zero Width Joiner
  '\uFEFF', // Zero Width No-Break Space (BOM)
  '\u2060', // Word Joiner
  '\u180E', // Mongolian Vowel Separator
  '\u200E', // Left-to-Right Mark
  '\u200F', // Right-to-Left Mark
  '\u202A', // Left-to-Right Embedding
  '\u202B', // Right-to-Left Embedding
  '\u202C', // Pop Directional Formatting
  '\u202D', // Left-to-Right Override
  '\u202E', // Right-to-Left Override
  '\u2066', // Left-to-Right Isolate
  '\u2067', // Right-to-Left Isolate
  '\u2068', // First Strong Isolate
  '\u2069', // Pop Directional Isolate
];

const ZERO_WIDTH_REGEX = new RegExp(`[${ZERO_WIDTH_CHARS.join('')}]`, 'g');

// Cuneiform Unicode block (U+12000 to U+123FF) - used in "Unicode bomb" DOS attacks
// These characters can cause exponential processing time in text rendering/layout engines
const CUNEIFORM_REGEX = /[\u{12000}-\u{123FF}]/gu;

/**
 * Checks if a string contains zero-width Unicode characters
 * @param text - The string to check
 * @returns true if the string contains zero-width characters
 */
export function containsZeroWidthChars(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }
  return ZERO_WIDTH_REGEX.test(text);
}

/**
 * Removes zero-width Unicode characters from a string
 * @param text - The string to sanitize
 * @returns The sanitized string with zero-width characters removed
 */
export function removeZeroWidthChars(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }
  return text.replace(ZERO_WIDTH_REGEX, '');
}

/**
 * Checks if a string contains Cuneiform Unicode characters
 * Cuneiform characters can be used in "Unicode bomb" DOS attacks due to their
 * complex rendering properties that can cause exponential processing time.
 * @param text - The string to check
 * @returns true if the string contains Cuneiform characters
 */
export function containsCuneiformChars(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }
  return CUNEIFORM_REGEX.test(text);
}

/**
 * Removes Cuneiform Unicode characters from a string
 * @param text - The string to sanitize
 * @returns The sanitized string with Cuneiform characters removed
 */
export function removeCuneiformChars(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }
  return text.replace(CUNEIFORM_REGEX, '');
}

/**
 * Validates that a string does not contain zero-width Unicode characters
 * @param text - The string to validate
 * @param fieldName - The name of the field being validated (for error messages)
 * @returns An object with isValid boolean and optional error message
 */
export function validateNoZeroWidthChars(
  text: string,
  fieldName: string = 'Field'
): { isValid: boolean; error?: string } {
  if (!text || typeof text !== 'string') {
    return { isValid: true };
  }

  if (containsZeroWidthChars(text)) {
    return {
      isValid: false,
      error: `${fieldName} contains zero-width Unicode characters which are not allowed for security reasons.`,
    };
  }

  return { isValid: true };
}

/**
 * Validates that a string does not contain Cuneiform Unicode characters
 * @param text - The string to validate
 * @param fieldName - The name of the field being validated (for error messages)
 * @returns An object with isValid boolean and optional error message
 */
export function validateNoCuneiformChars(
  text: string,
  fieldName: string = 'Field'
): { isValid: boolean; error?: string } {
  if (!text || typeof text !== 'string') {
    return { isValid: true };
  }

  if (containsCuneiformChars(text)) {
    return {
      isValid: false,
      error: `${fieldName} contains Cuneiform Unicode characters which are not allowed for security reasons.`,
    };
  }

  return { isValid: true };
}

/**
 * Validates task title and description for zero-width and Cuneiform characters
 * @param title - The task title
 * @param description - The task description
 * @returns An object with isValid boolean and optional error message
 */
export function validateTaskContent(
  title: string,
  description?: string
): { isValid: boolean; error?: string } {
  // Check for zero-width characters
  const titleValidation = validateNoZeroWidthChars(title, 'Title');
  if (!titleValidation.isValid) {
    return titleValidation;
  }

  if (description) {
    const descriptionValidation = validateNoZeroWidthChars(description, 'Description');
    if (!descriptionValidation.isValid) {
      return descriptionValidation;
    }
  }

  // Check for Cuneiform characters
  const titleCuneiformValidation = validateNoCuneiformChars(title, 'Title');
  if (!titleCuneiformValidation.isValid) {
    return titleCuneiformValidation;
  }

  if (description) {
    const descriptionCuneiformValidation = validateNoCuneiformChars(description, 'Description');
    if (!descriptionCuneiformValidation.isValid) {
      return descriptionCuneiformValidation;
    }
  }

  return { isValid: true };
}

/**
 * Validates project name and description for zero-width and Cuneiform characters
 * @param name - The project name
 * @param description - The project description
 * @returns An object with isValid boolean and optional error message
 */
export function validateProjectContent(
  name: string,
  description?: string
): { isValid: boolean; error?: string } {
  // Check for zero-width characters
  const nameValidation = validateNoZeroWidthChars(name, 'Name');
  if (!nameValidation.isValid) {
    return nameValidation;
  }

  if (description) {
    const descriptionValidation = validateNoZeroWidthChars(description, 'Description');
    if (!descriptionValidation.isValid) {
      return descriptionValidation;
    }
  }

  // Check for Cuneiform characters
  const nameCuneiformValidation = validateNoCuneiformChars(name, 'Name');
  if (!nameCuneiformValidation.isValid) {
    return nameCuneiformValidation;
  }

  if (description) {
    const descriptionCuneiformValidation = validateNoCuneiformChars(description, 'Description');
    if (!descriptionCuneiformValidation.isValid) {
      return descriptionCuneiformValidation;
    }
  }

  return { isValid: true };
}

/**
 * Validates comment text for zero-width and Cuneiform characters
 * @param text - The comment text
 * @returns An object with isValid boolean and optional error message
 */
export function validateCommentContent(
  text: string
): { isValid: boolean; error?: string } {
  // Check for zero-width characters
  const textValidation = validateNoZeroWidthChars(text, 'Comment text');
  if (!textValidation.isValid) {
    return textValidation;
  }

  // Check for Cuneiform characters
  const textCuneiformValidation = validateNoCuneiformChars(text, 'Comment text');
  if (!textCuneiformValidation.isValid) {
    return textCuneiformValidation;
  }

  return { isValid: true };
}

/**
 * Validates goal title and description for zero-width and Cuneiform characters
 * @param title - The goal title
 * @param description - The goal description
 * @returns An object with isValid boolean and optional error message
 */
export function validateGoalContent(
  title?: string,
  description?: string
): { isValid: boolean; error?: string } {
  // Check for zero-width characters
  if (title) {
    const titleValidation = validateNoZeroWidthChars(title, 'Goal title');
    if (!titleValidation.isValid) {
      return titleValidation;
    }
  }

  if (description) {
    const descriptionValidation = validateNoZeroWidthChars(description, 'Goal description');
    if (!descriptionValidation.isValid) {
      return descriptionValidation;
    }
  }

  // Check for Cuneiform characters
  if (title) {
    const titleCuneiformValidation = validateNoCuneiformChars(title, 'Goal title');
    if (!titleCuneiformValidation.isValid) {
      return titleCuneiformValidation;
    }
  }

  if (description) {
    const descriptionCuneiformValidation = validateNoCuneiformChars(description, 'Goal description');
    if (!descriptionCuneiformValidation.isValid) {
      return descriptionCuneiformValidation;
    }
  }

  return { isValid: true };
}

/**
 * Validates status name for zero-width and Cuneiform characters
 * @param name - The status name
 * @returns An object with isValid boolean and optional error message
 */
export function validateStatusContent(
  name: string
): { isValid: boolean; error?: string } {
  // Check for zero-width characters
  const nameValidation = validateNoZeroWidthChars(name, 'Status name');
  if (!nameValidation.isValid) {
    return nameValidation;
  }

  // Check for Cuneiform characters
  const nameCuneiformValidation = validateNoCuneiformChars(name, 'Status name');
  if (!nameCuneiformValidation.isValid) {
    return nameCuneiformValidation;
  }

  return { isValid: true };
}
