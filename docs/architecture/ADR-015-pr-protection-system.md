# ADR-015: PR Protection System

**Status:** IMPLEMENTED  
**Date:** 2026-02-15  
**Author:** Mr-Krabs (Squad Lead)  
**Deciders:** Cletus, Plankton, Rupert  

---

## Context

PRs with critical issues (🔥) were being merged despite agents commenting "BLOCKED". GitHub comments don't block merges - only review states do.

### Problem
- Agents used `gh pr comment "BLOCKED: issues found"` 
- Comments don't prevent merge button from being active
- PRs #31, #32, #33 merged with 🔥 issues

---

## Decision

Implement a 3-layer PR Protection System:

### Layer 1: GitHub Branch Protection (Attempted)
**Status:** FAILED - Requires GitHub Pro or public repository

Branch protection rules would have been ideal but require paid GitHub features.

### Layer 2: Agent PR Review Logic (IMPLEMENTED)

**Updated agents:** Cletus, Plankton, Rupert

**Protocol:**

```bash
# Check for 🔥 critical issues
if echo "$COMMENTS" | grep -q "🔥"; then
    gh pr review <PR> --request-changes \
      --body "❌ BLOCKED: Critical issues (🔥) found."
    exit 0  # STOP - don't merge
fi

# Check for ⚠️ warnings
if echo "$COMMENTS" | grep -q "⚠️"; then
    gh pr review <PR> --approve \
      --body "⚠️ Approved with notes..."
    gh pr merge <PR> --squash --delete-branch
    exit 0
fi

# Clean - approve and merge
gh pr review <PR> --approve --body "✅ LGTM!"
gh pr merge <PR> --squash --delete-branch
```

**Key Changes:**
- Use `--request-changes` for 🔥 issues (blocks merge via GitHub UI)
- Use `--approve` for clean PRs or ⚠️ only
- Never merge if 🔥 found

### Layer 3: Pre-Merge Check Script (IMPLEMENTED)

**Created:** `/root/.openclaw/tools/pre-merge-check.sh`

**Usage:**
```bash
./pre-merge-check.sh <PR_NUMBER> <REPO>
```

**Checks:**
1. Greptile review exists
2. No 🔥 critical issues  
3. Lists ⚠️ warnings (informational)

**Exit codes:**
- `0` = Safe to merge
- `1` = 🔥 issues found or Greptile not ready

### Layer 4: Auto-Fix Workflow (IMPLEMENTED)

**4-Phase Workflow:**

| Phase | Purpose | Actions |
|-------|---------|---------|
| **0: Pre-checks** | Validate readiness | Check conflicts, Greptile status, attempt count |
| **1: 🔥 Fix** | Auto-fix critical issues | Pattern-based fixes, build/test validation |
| **2: ⚠️ Handle** | Address warnings | Lint fixes, approve with notes, merge |
| **3: Clean** | Fast-path clean PRs | Approve and merge immediately |

**Fix Patterns:**
- Division by zero → Add `(total || 1)` check
- Null pointer → Add optional chaining `?.`
- Hook dependencies → Add missing deps to array
- Type mismatch → Fix type annotations

**Escalation Criteria:**
- Auto-fix fails 3 times → Escalate to Plankton
- Architecture changes needed → Escalate
- Security-related fixes → Escalate

---

## Consequences

### Positive
- 🔥 Issues now actually block merges
- Reduced manual oversight needed
- Faster turnaround on clean PRs
- Auto-fix reduces trivial back-and-forth

### Negative
- Requires GitHub CLI authentication
- Auto-fix may miss edge cases
- Still relies on agent discipline

### Risks
- Over-aggressive auto-fix could introduce bugs
- 3-attempt limit may not be sufficient for complex issues

---

## Implementation Status

| Agent | Status | Files Updated |
|-------|--------|---------------|
| Cletus | ✅ Done | PR Review Protocol + Auto-fix |
| Plankton | ✅ Done | PR Review Protocol + Escalation |
| Rupert | ✅ Done | PR Review Protocol + Auto-fix |

---

## Future Considerations

1. **GitHub Pro** - If repository goes public or upgrades, enable branch protection rules
2. **Required Checks** - Make pre-merge-check.sh a required status check
3. **Metrics** - Track auto-fix success rate vs escalation rate

---

*Architecture Decision Record - TaskLuid Project*
