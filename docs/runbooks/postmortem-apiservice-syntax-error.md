# Post-Mortem: apiService.ts Syntax Error

**Date:** 2026-02-15  
**Reporter:** Karen (QA Lead)  
**Assignee:** Cletus  
**Status:** RESOLVED  

---

## Summary

A syntax error in `src/services/apiService.ts` caused a build failure, blocking deployment of the Bulk Actions feature (Task #564). The error was a structural issue where async methods were defined outside the `ApiService` class wrapper.

---

## Timeline

| Time (UTC) | Event |
|------------|-------|
| 2026-02-15 ~13:00 | Cletus implements bulk actions feature |
| 2026-02-15 ~13:20 | Build triggered, fails with syntax error |
| 2026-02-15 ~13:30 | Karen QA review detects build failure |
| 2026-02-15 ~13:35 | Post-mortem created, fix assigned |

---

## Impact

- **Feature Blocked:** Bulk Actions UI cannot be deployed
- **Build Status:** Broken (vite:esbuild transform failure)
- **Affected Lines:** 254-298 in `apiService.ts`

---

## Root Cause

The `ApiService` class structure was corrupted during feature implementation:

1. **Line 254:** Extra closing brace `}` ended the class prematurely
2. **Lines 257-298:** Async methods (`getTeamVelocity`, `getTeamCycleTime`, etc.) defined at module level
3. **Line 299:** `export const apiService = new ApiService()` fails - class not properly defined

The methods use `this.request()` internally, indicating they should be class methods, not standalone functions.

---

## Error Details

```
[vite:esbuild] Transform failed with 1 error:
/tmp/task-luid-web/src/services/apiService.ts:257:8: ERROR: Expected ";" but found "getTeamVelocity"
```

---

## Fix Applied

Restored proper class structure:

```typescript
class ApiService {
  // ... existing methods ...
  
  // New analytics methods moved inside class
  async getTeamVelocity(teamId: string) {
    return this.request(`/api/teams/${teamId}/velocity`);
  }
  
  async getTeamCycleTime(teamId: string) {
    return this.request(`/api/teams/${teamId}/cycle-time`);
  }
  // ... etc
}

export const apiService = new ApiService();
```

---

## Prevention Measures

### Immediate
- [x] Fix class structure in apiService.ts
- [x] Re-run build validation
- [x] Re-submit for QA

### Process Improvements
- [ ] Add pre-commit hook to catch syntax errors
- [ ] Require build pass before PR submission
- [ ] Add TypeScript strict mode checks to CI

### Tooling
- [ ] Consider ESLint rule for class structure validation
- [ ] Add automated build check on PR open

---

## Lessons Learned

1. **Build validation is critical** - Even small structural errors block entire features
2. **Class integrity matters** - Async methods must be properly scoped
3. **QA catches what CI misses** - Human review still valuable for structural issues

---

*Documented by Gary, 2026-02-15*
