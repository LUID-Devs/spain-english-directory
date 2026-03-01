# Linear Reviews-style Code Review Integration

## Overview

This feature provides an enhanced code review experience similar to Linear's review workflow, allowing users to manage pull request reviews directly within TaskLuid.

## Features

### 1. Reviews Page (`/dashboard/reviews`)
A dedicated page for managing all your pull request reviews, similar to Linear's Reviews section.

**Key Capabilities:**
- Group PRs by Responsibility (To Do, Waiting for others, Approved, Authored by you)
- Group by Status, Author, or Repository
- Search and filter PRs
- Quick access to PR details and GitHub links
- Unread count badge on sidebar

### 2. Enhanced GitReviewPanel
Integrated within task detail views for reviewing linked PRs.

**Features:**
- View PR diffs with syntax highlighting
- Add inline comments on specific lines
- Review checklists (code quality, tests, documentation, security, performance)
- AI-powered code review integration
- Review status tracking (pending, reviewing, approved, changes_requested, merged)

### 3. Review Requests
Request and manage code reviews from team members.

**Features:**
- Request reviews from specific users
- Set due dates for reviews
- Accept/decline review requests
- Pending request notifications

### 4. Notifications
Stay updated on review activities.

**Features:**
- Badge count on sidebar
- Pending review request alerts
- Comment notifications
- AI review completion alerts

## Backend API Endpoints

### Review State
- `GET /api/git/tasks/:taskId/pull-requests/:prId/review` - Get review state
- `POST /api/git/tasks/:taskId/pull-requests/:prId/review` - Save review state
- `DELETE /api/git/tasks/:taskId/pull-requests/:prId/review` - Delete review state

### Diff
- `GET /api/git/pull-requests/:prId/diff` - Get PR diff

### Comments
- `GET /api/git/pull-requests/:prId/comments` - Get inline comments
- `POST /api/git/pull-requests/:prId/comments` - Add inline comment
- `PUT /api/git/comments/:commentId` - Update comment
- `DELETE /api/git/comments/:commentId` - Delete comment
- `POST /api/git/comments/:commentId/resolve` - Resolve comment

### Review Requests
- `GET /api/git/pull-requests/:prId/review-requests` - Get review requests for PR
- `GET /api/git/review-requests/pending` - Get pending requests for current user
- `POST /api/git/pull-requests/:prId/request-review` - Request a review
- `POST /api/git/review-requests/:requestId/respond` - Respond to request

### AI Review
- `GET /api/git/pull-requests/:prId/ai-review` - Get AI review results
- `POST /api/git/pull-requests/:prId/ai-review` - Start AI review

### Summary
- `GET /api/git/pull-requests/:prId/review-summary` - Get review summary

## Frontend Hooks

### useGitReview
```typescript
import { 
  usePRDiff,
  usePRComments,
  useAddInlineComment,
  useUpdateInlineComment,
  useDeleteInlineComment,
  useResolveInlineComment,
  usePRReviewState,
  usePRReviewRequests,
  usePendingReviewRequests,
  useRequestPRReview,
  useRespondToReviewRequest,
  useAIReviewResults,
  useStartAIReview,
  usePRReviewSummary,
  useGitReviewNotifications
} from '@/hooks/useGitReview';
```

### useGitReviewNotifications
```typescript
const { unreadCount, pendingRequests, hasUnread } = useGitReviewNotifications();
```

## Database Schema

### PRReview
Stores individual user's review state for a PR.

### InlineComment
Stores inline comments on PR diffs with support for threaded replies.

### PRReviewRequest
Stores review requests between users.

### AIReview
Stores AI review results and findings.

### AIAgent
Stores available AI agents for code review.

## Components

### GitReviewPanel
Main review panel for task detail views.

### ReviewsPage
Standalone page for managing all PR reviews.

### PRReviewNotifications
Notification component for review activities.

## Keyboard Shortcuts

- `G` + `R` - Go to Reviews page
- `O` + `R` - Open specific review (future)

## Future Enhancements

1. **GitHub Integration**: Direct PR status updates
2. **GitLab Support**: Extend to GitLab repositories
3. **Merge from Linear**: Ability to merge PRs directly from TaskLuid
4. **Code Diff Viewing**: Enhanced diff viewer with syntax highlighting
5. **Review Threads**: Threaded comment discussions
6. **Review Assignments**: Automatic reviewer assignment based on code ownership
7. **Review Analytics**: Review time metrics and insights

## Implementation Notes

- Review state is stored per-user, per-PR, per-task
- Comments support threading via `replyToId`
- AI reviews are asynchronous with status tracking
- Diff data is currently mocked but structured for GitHub API integration
