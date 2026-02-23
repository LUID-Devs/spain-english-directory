# Branch Protection Configuration for LUID-Devs

This directory contains Terraform configuration to enforce branch protection rules on all LUID-Devs repositories.

## Repositories Covered

1. **task-luid-web** - TaskLuid frontend
2. **task-luid-backend** - TaskLuid backend
3. **resume-luid-web** - ResumeLuid frontend
4. **resume-luid-backend** - ResumeLuid backend

## Branch Protection Rules Applied

Each repository has the following protection rules on the `main` branch:

### ✅ Required Status Checks
- **Strict**: Requires branches to be up-to-date before merging
- **CI Contexts**: Requires `ci` checks to pass

### ✅ Pull Request Reviews
- **Required approving reviews**: 1
- **Dismiss stale reviews**: Enabled (new commits dismiss previous approvals)
- **Require code owner reviews**: Disabled

### ✅ Admin Enforcement
- **Enforce admins**: Enabled (branch protection applies to admins too)

### ✅ Additional Restrictions
- **Allow force pushes**: Disabled
- **Allow deletions**: Disabled

## Why This Matters

**Security Context:** PR #13 was merged despite Greptile warnings because no branch protection was in place. These rules ensure:
1. All code changes require review
2. CI checks must pass before merge
3. Admins follow the same rules as everyone else
4. Force pushes and deletions are blocked

## Prerequisites

- GitHub Pro or public repositories
- Terraform >= 1.0
- GitHub token with `repo` and `admin:org` scopes

## Usage

```bash
# Initialize Terraform
cd terraform/branch-protection
terraform init

# Plan changes
terraform plan

# Apply configuration
terraform apply
```

## Manual Alternative

If Terraform is not available, branch protection can be configured manually:

1. Go to Repository → Settings → Branches
2. Click "Add rule" for `main` branch
3. Enable:
   - "Require a pull request before merging"
   - "Require status checks to pass before merging"
   - "Include administrators"
4. Save changes

Repeat for all 4 repositories.

## References

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Terraform GitHub Provider](https://registry.terraform.io/providers/integrations/github/latest/docs/resources/branch_protection)