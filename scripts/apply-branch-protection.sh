#!/bin/bash
# =============================================================================
# Branch Protection Setup Script for LUID-Devs Repositories
# =============================================================================
# This script configures branch protection on all 4 main repositories.
# 
# IMPORTANT: Requires GitHub Pro or public repositories.
# Free private repositories do not support branch protection.
#
# Usage:
#   export GITHUB_TOKEN="your-token"
#   ./apply-branch-protection.sh
# =============================================================================

set -euo pipefail

# Configuration
REPOS=(
  "task-luid-web"
  "task-luid-backend"
  "resume-luid-web"
  "resume-luid-backend"
)

OWNER="LUID-Devs"
BRANCH="main"

echo "========================================"
echo "Branch Protection Configuration"
echo "========================================"
echo ""
echo "This will apply branch protection to:"
for repo in "${REPOS[@]}"; do
  echo "  - $OWNER/$repo:$BRANCH"
done
echo ""

# Check for GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is required but not installed."
    echo "   Install from: https://cli.github.com/"
    exit 1
fi

# Check authentication
if ! gh auth status &>/dev/null; then
    echo "❌ Error: Not authenticated with GitHub CLI."
    echo "   Run: gh auth login"
    exit 1
fi

apply_protection() {
    local repo="$1"
    local full_repo="$OWNER/$repo"
    
    echo ""
    echo "Configuring $full_repo..."
    
    # Apply branch protection using GitHub API
    # This requires GitHub Pro for private repositories
    if gh api -X PUT "repos/$full_repo/branches/$BRANCH/protection" \
        -H "Accept: application/vnd.github+json" \
        -F "required_status_checks[strict]=true" \
        -F "required_status_checks[contexts][]=ci" \
        -F "enforce_admins=true" \
        -F "required_pull_request_reviews[required_approving_review_count]=1" \
        -F "required_pull_request_reviews[dismiss_stale_reviews]=true" \
        -F "required_pull_request_reviews[require_code_owner_reviews]=false" \
        -F "restrictions=null" \
        -F "allow_force_pushes=false" \
        -F "allow_deletions=false" 2>/dev/null; then
        
        echo "  ✅ Branch protection applied successfully"
        return 0
    else
        echo "  ❌ Failed to apply branch protection"
        echo "     Note: Private repositories require GitHub Pro for branch protection"
        return 1
    fi
}

# Apply to all repositories
FAILED=0
for repo in "${REPOS[@]}"; do
    if ! apply_protection "$repo"; then
        ((FAILED++))
    fi
done

echo ""
echo "========================================"
echo "Summary"
echo "========================================"
if [ $FAILED -eq 0 ]; then
    echo "✅ All repositories configured successfully!"
    exit 0
else
    echo "❌ $FAILED repository(ies) failed configuration"
    echo ""
    echo "If you see 'Upgrade to GitHub Pro' errors, you have two options:"
    echo ""
    echo "  1. Upgrade to GitHub Pro (paid)"
    echo "     https://github.com/pricing"
    echo ""
    echo "  2. Make repositories public (free)"
    echo "     Repository Settings → Danger Zone → Change visibility"
    echo ""
    echo "Branch protection is a security feature that requires one of the above."
    exit 1
fi