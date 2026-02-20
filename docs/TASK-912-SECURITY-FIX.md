# TASK-912: Visual Spoofing Prevention via Zero-Width Characters

## Summary

Implemented comprehensive input validation to detect and reject zero-width Unicode characters in task titles/descriptions and project names/descriptions to prevent visual spoofing attacks.

## Security Issue Addressed

**Visual Spoofing via Zero-Width Characters:**
Attackers can use zero-width Unicode characters to make task/project names appear different from their actual values. For example:
- `"Complete Review"` vs `"Complete\u200BReview"` (zero-width space)
- These appear visually similar but are different strings, enabling:
  - **Homograph attacks**: Malicious tasks masquerading as legitimate ones
  - **Bidirectional text attacks**: Using RLO/LRO characters to visually reverse text
  - **Social engineering**: Users may click on spoofed tasks thinking they're legitimate

**Unicode Bomb (Cuneiform) Attacks:**
Cuneiform characters (U+12000 to U+123FF) can cause exponential processing time in text rendering engines, potentially causing DOS.

## Implementation

### 1. Validation Module (`src/lib/validation.ts`)

A new utility module providing comprehensive validation functions:

| Function | Purpose |
|----------|---------|
| `containsZeroWidthChars(text)` | Detects zero-width characters in strings |
| `removeZeroWidthChars(text)` | Sanitizes strings by removing zero-width characters |
| `containsCuneiformChars(text)` | Detects Cuneiform characters (Unicode bomb protection) |
| `removeCuneiformChars(text)` | Removes Cuneiform characters from strings |
| `validateNoZeroWidthChars(text, fieldName)` | Validates text with descriptive error messages |
| `validateNoCuneiformChars(text, fieldName)` | Validates against Cuneiform characters |
| `validateTaskContent(title, description)` | Task-specific validation (both zero-width and Cuneiform) |
| `validateProjectContent(name, description)` | Project-specific validation (both zero-width and Cuneiform) |

### 2. API Service Integration (`src/services/apiService.ts`)

Validation integrated into task and project operations:

**Task Operations:**
- `createTask()` - Validates title and description before creation
- `updateTask()` - Validates title/description if provided during update

**Project Operations:**
- `createProject()` - Validates name and description before creation
- `updateProject()` - Validates name/description if provided during update

### 3. Zero-Width Characters Blocked

| Character | Code Point | Description |
|-----------|------------|-------------|
| Zero Width Space | U+200B | Invisible space character |
| Zero Width Non-Joiner | U+200C | Prevents character joining |
| Zero Width Joiner | U+200D | Enables character joining |
| Zero Width No-Break Space | U+FEFF | Also known as BOM |
| Word Joiner | U+2060 | Prevents line breaks |
| Mongolian Vowel Separator | U+180E | Legacy zero-width char |
| Left-to-Right Mark | U+200E | Bidi control character |
| Right-to-Left Mark | U+200F | Bidi control character |
| Left-to-Right Embedding | U+202A | Bidi control character |
| Right-to-Left Embedding | U+202B | Bidi control character |
| Pop Directional Formatting | U+202C | Bidi control character |
| Left-to-Right Override | U+202D | Bidi control character |
| Right-to-Left Override | U+202E | Bidi control character |
| Left-to-Right Isolate | U+2066 | Bidi control character |
| Right-to-Left Isolate | U+2067 | Bidi control character |
| First Strong Isolate | U+2068 | Bidi control character |
| Pop Directional Isolate | U+2069 | Bidi control character |

## Testing

### Test Suite (`src/lib/validation.test.ts`)

Comprehensive test coverage with 40+ test cases covering:

1. **Zero-Width Character Detection**
   - Normal text validation
   - Detection of all 17 zero-width character types
   - Edge cases (empty strings, null, undefined)
   - Mixed visible and invisible characters

2. **Cuneiform Character Detection**
   - Unicode bomb pattern detection
   - Characters in range U+12000 to U+123FF

3. **Task Content Validation**
   - Valid task titles and descriptions
   - Invalid titles with zero-width/Cuneiform chars
   - Invalid descriptions with zero-width/Cuneiform chars
   - Validation order (title checked before description)

4. **Project Content Validation**
   - Valid project names and descriptions
   - Invalid names with zero-width/Cuneiform chars
   - Invalid descriptions with zero-width/Cuneiform chars

5. **Visual Spoofing Attack Prevention**
   - Homograph attack detection
   - Bidirectional text attack detection
   - Unicode bomb pattern detection

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Error Handling

When zero-width characters are detected, the API throws an error with a clear message:

```typescript
// Task validation error
"Title contains zero-width Unicode characters which are not allowed for security reasons."

// Project validation error  
"Name contains zero-width Unicode characters which are not allowed for security reasons."

// Cuneiform validation error
"Description contains Cuneiform Unicode characters which are not allowed for security reasons."
```

## Usage Example

```typescript
import { validateTaskContent, validateProjectContent } from '@/lib/validation';
import { apiService } from '@/services/apiService';

// Validation is automatically applied in apiService methods
// Manual validation if needed:
const taskValidation = validateTaskContent('Task Title', 'Description');
if (!taskValidation.isValid) {
  console.error(taskValidation.error);
  // Handle error
}

const projectValidation = validateProjectContent('Project Name', 'Description');
if (!projectValidation.isValid) {
  console.error(projectValidation.error);
  // Handle error
}
```

## Security Impact

- **Visual Spoofing Prevention**: Attackers can no longer use zero-width characters to make tasks appear different from what they actually are
- **Homograph Attack Mitigation**: Prevents confusion attacks where malicious tasks mimic legitimate ones
- **Bidirectional Text Attack Prevention**: Blocks RLO/LRO attacks that can visually reverse text
- **DOS Prevention**: Cuneiform character detection prevents "Unicode bomb" attacks
- **Data Integrity**: Ensures task/project titles and descriptions contain only visible, meaningful characters

## Files Changed

1. `src/lib/validation.ts` - New validation utility module
2. `src/lib/validation.test.ts` - Comprehensive test suite
3. `src/services/apiService.ts` - Integration of validation in API methods
4. `package.json` - Added vitest testing framework
5. `vitest.config.ts` - Vitest configuration

## Future Considerations

1. **Backend Validation**: While frontend validation provides immediate user feedback, backend validation should also be implemented as a defense-in-depth measure.
2. **Extended Unicode Support**: Consider expanding detection to other potentially dangerous Unicode ranges (e.g., unusual spaces, combining characters).
3. **Sanitization Mode**: Option to automatically sanitize input by removing dangerous characters rather than rejecting.
