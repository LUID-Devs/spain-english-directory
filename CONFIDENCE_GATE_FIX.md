# Confidence Gate Investigation - Summary

## Investigation Results

### Root Cause of Confidence Gate Failures

The confidence gate workflow (`.github/workflows/greptile-confidence.yml`) fails when:
1. The PR body does not contain a "Confidence Score: X/5" pattern
2. OR the extracted score is less than 4/5

### Issues Found

#### PR #170 (Priority Target)
**Original Score:** 2/5 - Failed
**Issues Identified:**
1. **Resource leak in `limitedFetch.ts`**: Slots were held during retry sleep, exhausting the concurrency pool
2. **Unreachable code**: Lines 107-109 had dead code after the while loop
3. **Inconsistent adoption**: Profile update in `settings/page.tsx` used raw `fetch` instead of `limitedFetch`
4. **Missing loading state reset**: When userId validation fails, loading state wasn't reset

**Fixes Applied:**
1. ✅ Fixed resource leak by releasing slots BEFORE sleeping during retries
2. ✅ Removed unreachable code, now returns `lastResponse` instead of raw `fetch()`
3. ✅ Settings page now uses `limitedFetch` for profile and password API calls
4. ✅ Added proper loading state reset when userId validation fails

**Commits:**
- `5832d12` - Initial fix for resource leak and unreachable code
- `59e2521` - Trigger commit for Greptile re-review
- `6e1f7c5` - Fixed slot release timing (release before sleep, not after)

**Current Status:** Waiting for Greptile to re-review commit `6e1f7c5`

#### PR #138 (Already has 5/5 score)
**Score:** 5/5 - Should pass but confidence_gate check shows "in_progress"
**Issue:** The confidence_gate check is stuck/cancelled from a previous run
**Action Taken:** Re-triggered workflow run 22379152069

## Technical Details

### Confidence Gate Workflow Logic
```javascript
// From .github/workflows/greptile-confidence.yml
const text = (prData.body || "").replace(/<[^>]+>/g, "");
const m = text.match(/Confidence Score:\s*([0-5](?:\.\d+)?)\s*\/\s*5/i);

if (!m) {
  core.setFailed("Greptile confidence score not found in PR body");
  return;
}

const score = parseFloat(m[1]);
if (score < 4) core.setFailed(`Greptile confidence ${score}/5 < 4/5`);
else console.log(`Greptile confidence ${score}/5 ✅`);
```

### limitedFetch.ts - Key Fix
The critical fix was releasing the concurrency slot BEFORE the backoff sleep:

```typescript
// BEFORE (buggy):
} finally {
  release();  // Released AFTER sleep
}

// AFTER (fixed):
// Release slot BEFORE sleeping for retry
release();
shouldRelease = false;
const jitter = Math.floor(Math.random() * 250);
const backoff = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt + jitter);
await sleep(retryAfterMs ?? backoff);
```

## Recommendations

1. **For PR #170:** Greptile needs to re-review the latest commit (6e1f7c5) to update the confidence score from 2/5 to a passing score.

2. **For PR #138:** Already has 5/5 score but needs the confidence_gate check to complete. The re-triggered run should resolve this.

3. **For other PRs:** They likely have similar code issues that need fixing before they'll pass the confidence gate.

## Files Modified

1. `src/services/limitedFetch.ts` - Fixed resource leak and unreachable code
2. `src/app/dashboard/settings/page.tsx` - Migrated to limitedFetch, fixed loading state bug
