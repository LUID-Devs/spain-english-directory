terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.0"
}

provider "github" {
  owner = "LUID-Devs"
  # Configure token via GITHUB_TOKEN environment variable
}

# ============================================
# task-luid-web Branch Protection
# ============================================
resource "github_branch_protection" "task_luid_web_main" {
  repository_id = "task-luid-web"
  pattern       = "main"

  # Require status checks
  required_status_checks {
    strict   = true  # Require branches to be up-to-date before merging
    contexts = []    # No CI checks required yet (no workflow runs on PRs)
  }

  # Require pull request reviews
  required_pull_request_reviews {
    required_approving_review_count = 1
    dismiss_stale_reviews           = true
    require_code_owner_reviews      = false
  }

  # Enforce for admins too
  enforce_admins = true

  # Restrictions
  allows_force_pushes = false
  allows_deletions    = false
}

# ============================================
# task-luid-backend Branch Protection
# ============================================
resource "github_branch_protection" "task_luid_backend_main" {
  repository_id = "task-luid-backend"
  pattern       = "main"

  required_status_checks {
    strict   = true
    contexts = []  # No CI checks required yet
  }

  required_pull_request_reviews {
    required_approving_review_count = 1
    dismiss_stale_reviews           = true
    require_code_owner_reviews      = false
  }

  enforce_admins = true

  allows_force_pushes = false
  allows_deletions    = false
}

# ============================================
# resume-luid-web Branch Protection
# ============================================
resource "github_branch_protection" "resume_luid_web_main" {
  repository_id = "resume-luid-web"
  pattern       = "main"

  required_status_checks {
    strict   = true
    contexts = []  # No CI checks required yet
  }

  required_pull_request_reviews {
    required_approving_review_count = 1
    dismiss_stale_reviews           = true
    require_code_owner_reviews      = false
  }

  enforce_admins = true

  allows_force_pushes = false
  allows_deletions    = false
}

# ============================================
# resume-luid-backend Branch Protection
# ============================================
resource "github_branch_protection" "resume_luid_backend_main" {
  repository_id = "resume-luid-backend"
  pattern       = "main"

  required_status_checks {
    strict   = true
    contexts = []  # No CI checks required yet
  }

  required_pull_request_reviews {
    required_approving_review_count = 1
    dismiss_stale_reviews           = true
    require_code_owner_reviews      = false
  }

  enforce_admins = true

  allows_force_pushes = false
  allows_deletions    = false
}