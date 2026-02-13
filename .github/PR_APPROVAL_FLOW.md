# Pull Request Approval Flow (Team Policy)

## Roles
- **Plankton** = Lead Developer (final technical gate)
- **Karen** = QA Lead (risk + regression gate)
- **Larry** = DevOps (CI/CD + infrastructure gate)
- **Cletus / Plankton** = Developer (implements PRs; cannot self-approve)
- **Squidward** = Product Analyst (analytics/experiments gate when applicable)
- **Mr. Krabs** = Product Manager (scope/release gate when applicable)

---

## Global Rules

1. **No PR can be merged if CI is failing.**
2. **Cletus (or the author) cannot approve their own PR.**
3. **Greptile comments must be reviewed:**
   - Critical findings must be fixed or justified in the PR discussion.
4. **Any PR with DB migrations, auth, billing, or core workflow changes is automatically HIGH RISK.**

---

## Standard PR Flow (Step-by-Step)

### 1) Create PR (Author: usually Cletus)

PR must include:
- Summary of change
- Risk level (Low/Medium/High)
- Testing notes (what was tested)
- Deployment notes (migration? rollback?)

### 2) Automated Checks

- GitHub Actions runs tests/lint/build
- Greptile posts first-pass review comments

### 3) Address Automated Feedback (Author)

- Fix CI failures
- Fix or justify Greptile critical issues
- Update PR description if scope changes

### 4) Human Review + Approvals (Required Based on Type)

#### A) Normal Feature PR

**Required approvals:**
- ✅ Plankton

**Optional (recommended if Medium/High risk):**
- 🤖 Karen

#### B) Bug Fix PR

**Required approvals:**
- ✅ Plankton
- ✅ Karen

**Rule:**
- Add a regression test when it fits.
- If skipped, explain why in PR.

#### C) Infrastructure / CI/CD PR

**Required approvals:**
- ✅ Larry
- ✅ Plankton (recommended for repo-wide impact)

#### D) Analytics / Experiment PR

**Required approvals:**
- ✅ Squidward
- ✅ Plankton

#### E) High-Risk PR (auth/billing/migrations/core flows)

**Required approvals:**
- ✅ Plankton
- ✅ Karen
- ✅ Larry (only if deployment/infra changes are included)

### 5) Merge Conditions

A PR can be merged only if:
- CI is green
- Required reviewers approved (based on PR type)
- No unresolved P0/P1 issues raised by Karen
- Greptile critical issues are fixed or justified

### 6) Release / Deployment (If applicable)

- Larry coordinates deployment after merge
- Karen validates post-deploy sanity checks (for high-risk releases)
- Gary updates docs/changelog after "Done"
- SpongeBob publishes external update if user-facing

---

## Risk Level Definitions

**LOW:**
- UI text, small styling changes, non-critical refactors

**MEDIUM:**
- Feature additions, moderate logic changes, non-core workflows

**HIGH:**
- Auth, billing, migrations, data integrity, core workflow changes, major refactors

---

## Escalation Rule

If reviewers disagree:
- **Plankton** decides technical direction
- **Karen** can block release for quality risk (P0/P1)
- **Mr. Krabs** can reprioritize scope/release timing
