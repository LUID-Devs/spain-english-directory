/**
 * Validation utilities for preventing visual spoofing attacks
 * via zero-width Unicode characters and DOS attacks via Cuneiform characters
 */

// Zero-width Unicode characters that can be used for visual spoofing
// Zero-width Unicode characters that can be used for visual spoofing
// Defined as array of code points to avoid misleading character class issues
const ZERO_WIDTH_CHARS = [
  0x200B, // Zero Width Space
  0x200C, // Zero Width Non-Joiner
  0x200D, // Zero Width Joiner
  0xFEFF, // Zero Width No-Break Space (BOM)
  0x2060, // Word Joiner
  0x180E, // Mongolian Vowel Separator
  0x200E, // Left-to-Right Mark
  0x200F, // Right-to-Left Mark
  0x202A, // Left-to-Right Embedding
  0x202B, // Right-to-Left Embedding
  0x202C, // Pop Directional Formatting
  0x202D, // Left-to-Right Override
  0x202E, // Right-to-Left Override
  0x2066, // Left-to-Right Isolate
  0x2067, // Right-to-Left Isolate
  0x2068, // First Strong Isolate
  0x2069, // Pop Directional Isolate
];

// Cuneiform Unicode block (U+12000 to U+123FF) - used in "Unicode bomb" DOS attacks
// These characters can cause exponential processing time in text rendering/layout engines
const CUNEIFORM_START = 0x12000;
const CUNEIFORM_END = 0x123FF;

/**
 * Checks if a string contains zero-width Unicode characters
 * @param text - The string to check
 * @returns true if the string contains zero-width characters
 */
export function containsZeroWidthChars(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }
  // Check each character against zero-width code points
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Handle surrogate pairs for high Unicode
    if (code >= 0xD800 && code <= 0xDBFF && i + 1 < text.length) {
      const high = code;
      const low = text.charCodeAt(i + 1);
      const fullCode = ((high - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
      if (fullCode >= CUNEIFORM_START && fullCode <= CUNEIFORM_END) {
        return true; // Actually Cuneiform, but we check this separately
      }
      i++; // Skip the low surrogate
    } else if (ZERO_WIDTH_CHARS.includes(code)) {
      return true;
    }
  }
  return false;
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
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (!ZERO_WIDTH_CHARS.includes(code)) {
      result += text[i];
    }
  }
  return result;
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
  // Check for Cuneiform characters (U+12000 to U+123FF)
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0xD800 && code <= 0xDBFF && i + 1 < text.length) {
      const high = code;
      const low = text.charCodeAt(i + 1);
      const fullCode = ((high - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
      if (fullCode >= CUNEIFORM_START && fullCode <= CUNEIFORM_END) {
        return true;
      }
      i++; // Skip the low surrogate
    }
  }
  return false;
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
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0xD800 && code <= 0xDBFF && i + 1 < text.length) {
      const high = code;
      const low = text.charCodeAt(i + 1);
      const fullCode = ((high - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
      if (fullCode >= CUNEIFORM_START && fullCode <= CUNEIFORM_END) {
        i++; // Skip the low surrogate
        continue; // Skip this Cuneiform character
      }
      result += text[i];
      i++; // Skip the low surrogate
    } else {
      result += text[i];
    }
  }
  return result;
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
  title?: string,
  description?: string
): { isValid: boolean; error?: string } {
  if (!title && !description) {
    return { isValid: true };
  }
  // Check for zero-width characters
  if (title) {
    const titleValidation = validateNoZeroWidthChars(title, 'Title');
    if (!titleValidation.isValid) {
      return titleValidation;
    }
  }

  if (description) {
    const descriptionValidation = validateNoZeroWidthChars(description, 'Description');
    if (!descriptionValidation.isValid) {
      return descriptionValidation;
    }
  }

  // Check for Cuneiform characters
  if (title) {
    const titleCuneiformValidation = validateNoCuneiformChars(title, 'Title');
    if (!titleCuneiformValidation.isValid) {
      return titleCuneiformValidation;
    }
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
  name?: string,
  description?: string
): { isValid: boolean; error?: string } {
  if (!name && !description) {
    return { isValid: true };
  }

  // Check for zero-width characters
  if (name) {
    const nameValidation = validateNoZeroWidthChars(name, 'Name');
    if (!nameValidation.isValid) {
      return nameValidation;
    }
  }

  if (description) {
    const descriptionValidation = validateNoZeroWidthChars(description, 'Description');
    if (!descriptionValidation.isValid) {
      return descriptionValidation;
    }
  }

  // Check for Cuneiform characters
  if (name) {
    const nameCuneiformValidation = validateNoCuneiformChars(name, 'Name');
    if (!nameCuneiformValidation.isValid) {
      return nameCuneiformValidation;
    }
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
  text?: string
): { isValid: boolean; error?: string } {
  if (!text) {
    return { isValid: true };
  }
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
