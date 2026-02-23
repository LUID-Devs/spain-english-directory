# Security: Configure Branch Protection on All Repositories

**Task:** TASK-712  
**Priority:** P0 - Critical Security  
**Date:** 2026-02-23  
**Author:** larry (DevOps)

---

## 🚨 Security Issue

**CRITICAL GAP:** No branch protection configured on any of the 4 main repositories.

**Incident:** PR #13 was merged despite Greptile warnings because no enforcement mechanism was in place.

**Risk Level:** HIGH
- Direct pushes to `main` are currently possible
- PRs can be merged without review
- CI failures don't block merges
- Admins can bypass any checks

---

## ✅ Solution Implemented

This PR provides Infrastructure-as-Code (Terraform) and scripts to enforce branch protection rules across all repositories.

### Repositories Covered

| Repository | Type | Status |
|------------|------|--------|
| task-luid-web | Frontend | 🔒 Pending |
| task-luid-backend | Backend | 🔒 Pending |
| resume-luid-web | Frontend | 🔒 Pending |
| resume-luid-backend | Backend | 🔒 Pending |

### Branch Protection Rules

Each repository's `main` branch will have:

#### 1. Required Status Checks ⚠️
- **Strict updates**: Branches must be up-to-date before merging
- **CI requirement**: ❌ DISABLED - No CI workflow runs on PRs currently. When CI is added, this should be re-enabled.

#### 2. Pull Request Reviews ✅
- **Required approvals**: 1 minimum
- **Dismiss stale reviews**: New commits invalidate previous approvals
- **Code owner reviews**: Optional (not enforced)

#### 3. Admin Enforcement ✅
- **Enforce for admins**: Admins must follow the same rules

#### 4. Additional Restrictions ✅
- **Force pushes**: Blocked
- **Branch deletions**: Blocked

---

## 📁 Files Added

```
terraform/branch-protection/
├── README.md           # Documentation and manual guide
└── main.tf             # Terraform configuration

scripts/
└── apply-branch-protection.sh  # Bash script alternative
```

---

## 🔧 Usage

### Option 1: Terraform (Recommended)

```bash
cd terraform/branch-protection
terraform init
terraform plan
terraform apply
```

### Option 2: Bash Script

```bash
export GITHUB_TOKEN="your-token"
./scripts/apply-branch-protection.sh
```

### Option 3: Manual Configuration

See `terraform/branch-protection/README.md` for manual steps.

---

## ⚠️ Prerequisites

**IMPORTANT:** Branch protection requires ONE of the following:

1. **GitHub Pro** (paid plan)
   - https://github.com/pricing
   
2. **Public repositories** (free)
   - Change visibility in Repository Settings → Danger Zone

Free private repositories do not support branch protection.

---

## 🔒 Security Benefits

After applying this configuration:

1. ✅ All code changes require PR review
2. ⚠️ CI checks are NOT required yet (no CI workflow on PRs) - **TODO: Add CI workflow and re-enable required checks**
3. ✅ Admins cannot bypass rules
4. ✅ Force pushes are blocked
5. ✅ Accidental deletions are prevented
6. ✅ Greptile warnings will block merges (via required reviews)

---

## 📋 Pre-Merge Checklist

- [ ] Decide: Upgrade to GitHub Pro OR make repos public
- [ ] Apply configuration using one of the provided methods
- [ ] Verify protection is active (try pushing to main - should fail)
- [ ] Update team documentation
- [ ] Close this PR once verified

---

## References

- [GitHub Branch Protection Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Terraform GitHub Provider](https://registry.terraform.io/providers/integrations/github/latest/docs/resources/branch_protection)
- Task: TASK-712