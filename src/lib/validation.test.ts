import { describe, it, expect } from 'vitest';
import {
  containsZeroWidthChars,
  removeZeroWidthChars,
  containsCuneiformChars,
  removeCuneiformChars,
  validateNoZeroWidthChars,
  validateNoCuneiformChars,
  validateTaskContent,
  validateProjectContent,
} from './validation';

describe('Zero-Width Character Validation', () => {
  describe('containsZeroWidthChars', () => {
    it('should return false for normal text without zero-width characters', () => {
      expect(containsZeroWidthChars('Hello World')).toBe(false);
      expect(containsZeroWidthChars('Task Title')).toBe(false);
      expect(containsZeroWidthChars('Complete the review')).toBe(false);
    });

    it('should return true for text containing zero-width space (U+200B)', () => {
      const textWithZWS = 'Complete\u200BReview'; // Zero-width space between words
      expect(containsZeroWidthChars(textWithZWS)).toBe(true);
    });

    it('should return true for text containing zero-width non-joiner (U+200C)', () => {
      const textWithZWNJ = 'Test\u200CTitle';
      expect(containsZeroWidthChars(textWithZWNJ)).toBe(true);
    });

    it('should return true for text containing zero-width joiner (U+200D)', () => {
      const textWithZWJ = 'Project\u200DName';
      expect(containsZeroWidthChars(textWithZWJ)).toBe(true);
    });

    it('should return true for text containing zero-width no-break space/BOM (U+FEFF)', () => {
      const textWithBOM = '\uFEFFTask Title';
      expect(containsZeroWidthChars(textWithBOM)).toBe(true);
    });

    it('should return true for text containing word joiner (U+2060)', () => {
      const textWithWJ = 'Task\u2060Title';
      expect(containsZeroWidthChars(textWithWJ)).toBe(true);
    });

    it('should return true for text containing Mongolian vowel separator (U+180E)', () => {
      const textWithMVS = 'Test\u180ETitle';
      expect(containsZeroWidthChars(textWithMVS)).toBe(true);
    });

    it('should return true for text containing bidi control characters', () => {
      expect(containsZeroWidthChars('Test\u200ETitle')).toBe(true); // LRM
      expect(containsZeroWidthChars('Test\u200FTitle')).toBe(true); // RLM
      expect(containsZeroWidthChars('Test\u202ATitle')).toBe(true); // LRE
      expect(containsZeroWidthChars('Test\u202BTitle')).toBe(true); // RLE
      expect(containsZeroWidthChars('Test\u202CTitle')).toBe(true); // PDF
      expect(containsZeroWidthChars('Test\u202DTitle')).toBe(true); // LRO
      expect(containsZeroWidthChars('Test\u202ETitle')).toBe(true); // RLO
      expect(containsZeroWidthChars('Test\u2066Title')).toBe(true); // LRI
      expect(containsZeroWidthChars('Test\u2067Title')).toBe(true); // RLI
      expect(containsZeroWidthChars('Test\u2068Title')).toBe(true); // FSI
      expect(containsZeroWidthChars('Test\u2069Title')).toBe(true); // PDI
    });

    it('should return false for empty string', () => {
      expect(containsZeroWidthChars('')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(containsZeroWidthChars(null as any)).toBe(false);
      expect(containsZeroWidthChars(undefined as any)).toBe(false);
    });

    it('should return true for mixed visible and zero-width characters', () => {
      const mixed = 'Hello\u200BWorld\u200CTest';
      expect(containsZeroWidthChars(mixed)).toBe(true);
    });
  });

  describe('removeZeroWidthChars', () => {
    it('should return the same string if no zero-width characters', () => {
      const text = 'Hello World';
      expect(removeZeroWidthChars(text)).toBe(text);
    });

    it('should remove all zero-width characters from text', () => {
      const textWithZWC = 'Hello\u200B\u200C\u200DWorld\uFEFF';
      expect(removeZeroWidthChars(textWithZWC)).toBe('HelloWorld');
    });

    it('should remove bidi control characters', () => {
      const textWithBidi = '\u200ETest\u200FString\u202A\u202B';
      expect(removeZeroWidthChars(textWithBidi)).toBe('TestString');
    });

    it('should handle empty string', () => {
      expect(removeZeroWidthChars('')).toBe('');
    });

    it('should handle null or undefined', () => {
      expect(removeZeroWidthChars(null as any)).toBe(null);
      expect(removeZeroWidthChars(undefined as any)).toBe(undefined);
    });
  });

  describe('validateNoZeroWidthChars', () => {
    it('should return isValid true for clean text', () => {
      const result = validateNoZeroWidthChars('Clean Title', 'Title');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return isValid false for text with zero-width characters', () => {
      const result = validateNoZeroWidthChars('Bad\u200BTitle', 'Title');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Title contains zero-width Unicode characters which are not allowed for security reasons.');
    });

    it('should use default field name if not provided', () => {
      const result = validateNoZeroWidthChars('Bad\u200BText');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Field');
    });

    it('should return isValid true for empty string', () => {
      const result = validateNoZeroWidthChars('', 'Title');
      expect(result.isValid).toBe(true);
    });
  });
});

describe('Cuneiform Character Validation', () => {
  describe('containsCuneiformChars', () => {
    it('should return false for normal text without Cuneiform characters', () => {
      expect(containsCuneiformChars('Hello World')).toBe(false);
      expect(containsCuneiformChars('Task Title')).toBe(false);
    });

    it('should return true for text containing Cuneiform characters', () => {
      // Cuneiform characters are in range U+12000 to U+123FF
      const textWithCuneiform = 'Test\u{12000}Title';
      expect(containsCuneiformChars(textWithCuneiform)).toBe(true);
    });

    it('should return true for text with multiple Cuneiform characters', () => {
      const textWithMultiple = '\u{12000}\u{12001}\u{12002}';
      expect(containsCuneiformChars(textWithMultiple)).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(containsCuneiformChars('')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(containsCuneiformChars(null as any)).toBe(false);
      expect(containsCuneiformChars(undefined as any)).toBe(false);
    });
  });

  describe('removeCuneiformChars', () => {
    it('should return the same string if no Cuneiform characters', () => {
      const text = 'Hello World';
      expect(removeCuneiformChars(text)).toBe(text);
    });

    it('should remove all Cuneiform characters from text', () => {
      const textWithCuneiform = 'Hello\u{12000}World\u{123FF}';
      expect(removeCuneiformChars(textWithCuneiform)).toBe('HelloWorld');
    });

    it('should handle empty string', () => {
      expect(removeCuneiformChars('')).toBe('');
    });

    it('should handle null or undefined', () => {
      expect(removeCuneiformChars(null as any)).toBe(null);
      expect(removeCuneiformChars(undefined as any)).toBe(undefined);
    });
  });

  describe('validateNoCuneiformChars', () => {
    it('should return isValid true for clean text', () => {
      const result = validateNoCuneiformChars('Clean Title', 'Title');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return isValid false for text with Cuneiform characters', () => {
      const result = validateNoCuneiformChars('Bad\u{12000}Title', 'Title');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Title contains Cuneiform Unicode characters which are not allowed for security reasons.');
    });
  });
});

describe('Task Content Validation', () => {
  describe('validateTaskContent', () => {
    it('should return isValid true for valid task content', () => {
      const result = validateTaskContent('Task Title', 'Task Description');
      expect(result.isValid).toBe(true);
    });

    it('should return isValid true for title only', () => {
      const result = validateTaskContent('Task Title');
      expect(result.isValid).toBe(true);
    });

    it('should return isValid false for title with zero-width characters', () => {
      const result = validateTaskContent('Task\u200BTitle', 'Description');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Title');
    });

    it('should return isValid false for description with zero-width characters', () => {
      const result = validateTaskContent('Title', 'Desc\u200Dription');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Description');
    });

    it('should return isValid false for title with Cuneiform characters', () => {
      const result = validateTaskContent('Task\u{12000}Title', 'Description');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Title');
      expect(result.error).toContain('Cuneiform');
    });

    it('should return isValid false for description with Cuneiform characters', () => {
      const result = validateTaskContent('Title', 'Desc\u{12000}ription');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Description');
      expect(result.error).toContain('Cuneiform');
    });

    it('should check title before description', () => {
      // Both have issues, but title should be reported first
      const result = validateTaskContent('Bad\u200BTitle', 'Bad\u200DDescription');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Title');
    });
  });
});

describe('Project Content Validation', () => {
  describe('validateProjectContent', () => {
    it('should return isValid true for valid project content', () => {
      const result = validateProjectContent('Project Name', 'Project Description');
      expect(result.isValid).toBe(true);
    });

    it('should return isValid true for name only', () => {
      const result = validateProjectContent('Project Name');
      expect(result.isValid).toBe(true);
    });

    it('should return isValid false for name with zero-width characters', () => {
      const result = validateProjectContent('Project\u200BName', 'Description');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Name');
    });

    it('should return isValid false for description with zero-width characters', () => {
      const result = validateProjectContent('Name', 'Desc\u200Cription');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Description');
    });

    it('should return isValid false for name with Cuneiform characters', () => {
      const result = validateProjectContent('Project\u{12000}Name', 'Description');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Name');
      expect(result.error).toContain('Cuneiform');
    });

    it('should return isValid false for description with Cuneiform characters', () => {
      const result = validateProjectContent('Name', 'Desc\u{123FF}ription');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Description');
      expect(result.error).toContain('Cuneiform');
    });

    it('should check name before description', () => {
      // Both have issues, but name should be reported first
      const result = validateProjectContent('Bad\u200BName', 'Bad\u200DDescription');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Name');
    });
  });
});

describe('Visual Spoofing Attack Prevention', () => {
  it('should detect homograph attacks using zero-width characters', () => {
    // Simulating an attack where "CompleteReview" and "Complete Review" look the same
    // but one has a zero-width space between the words
    const legitimateTask = 'Complete Review';
    const spoofedTask = 'Complete\u200BReview'; // Zero-width space instead of real space
    
    expect(containsZeroWidthChars(legitimateTask)).toBe(false);
    expect(containsZeroWidthChars(spoofedTask)).toBe(true);
  });

  it('should detect bidirectional text attacks', () => {
    // Attack using RLO (Right-to-Left Override) to visually reverse text
    const maliciousText = 'Invoice\u202Etxt.exe\u202C'; // RLO then PDF to reset
    expect(containsZeroWidthChars(maliciousText)).toBe(true);
  });

  it('should validate task titles that look similar but are different', () => {
    const task1 = validateTaskContent('Urgent Task', 'Description');
    const task2 = validateTaskContent('Urgent\u200BTask', 'Description');
    
    expect(task1.isValid).toBe(true);
    expect(task2.isValid).toBe(false);
  });

  it('should detect Unicode bomb patterns (Cuneiform)', () => {
    // Cuneiform characters can cause exponential processing time
    const unicodeBomb = '\u{12000}\u{12001}\u{12002}';
    expect(containsCuneiformChars(unicodeBomb)).toBe(true);
    
    const result = validateTaskContent('Title', `Description with ${unicodeBomb}`);
    expect(result.isValid).toBe(false);
  });
});
