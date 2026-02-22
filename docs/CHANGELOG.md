# Changelog

All notable changes to TaskLuid Web will be documented in this file.

## [Unreleased]

### Added
- **Pricing Page** - Complete pricing page with annual plans and feature comparison (Task #930)
  - Monthly and annual billing toggle with 20% discount
  - Side-by-side feature comparison table
  - Plan cards: Free, Pro ($12/mo), Team ($49/mo), Enterprise (custom)
  - FAQ section addressing common pricing questions
  - Call-to-action buttons for each plan
  - Responsive design with gradient accents
  - Task: #930 (Cletus)

- **Social Proof & Trust Signals** - Enhanced landing page credibility (Task #949)
  - Client logos showcase (Acme Corp, Globex, Initech, etc.)
  - Testimonials section with star ratings
  - "Trusted by X teams" statistics
  - "As seen on" media badges
  - Trust badge components for security/privacy
  - Task: #949 (Cletus)

### Security
- **XSS Sanitization** - Applied sanitization to all dangerouslySetInnerHTML usage (Task #617)
  - Task descriptions sanitized via `sanitizeHtmlContent()` in TaskDetailPage
  - Comments sanitized via `sanitizeHtmlContent()` in CommentsSection
  - Removes script tags, event handlers, javascript: URLs, and other XSS vectors

### Fixed
- **Pricing Page 404** - Fixed broken pricing page routing (Task #593)
- **DashboardSkeleton Import** - Fixed import path for Mission Control dashboard (Task #563)

## [2026-02-15] - Triage View, Analytics & UX Improvements

### Added
- **Triage View** - Incoming task management interface (Task #559)
  - Dedicated view for un-prioritized tasks
  - Quick prioritization actions
  - Streamlined triage workflow

- **Team Analytics Dashboard** - Visual team metrics (Task #558)
  - Team velocity charts
  - Cycle time analytics
  - Performance indicators

- **Mission Control Dashboard** - Agent monitoring interface (Task #578)
  - Real-time agent status
  - System health monitoring
  - Error tracking and alerts

- **Bulk Actions UI** - Batch task operations (Task #564)
  - Multi-select task list
  - Bulk delete with undo/toast
  - Bulk status updates

- **Rate Limiting UI Feedback** - Better auth UX (Task #572)
  - Visual feedback on rate limits
  - Password reset improvements
  - Loading states for auth actions

- **404 Page Search** - Improved error recovery (Task #570)
  - Search functionality on 404 pages
  - Quick navigation to common pages

- **Pricing Link** - Navigation improvements
  - Added pricing to landing page nav
  - Templates link in desktop nav

### Fixed
- **Homepage Content Gap** - Reduced excessive vertical padding (Task #580)
- **Auth Error Messages** - Clearer Mission Control errors (Task #571)
- **Clipboard API** - Fallback for CreateAgentModal (Task #573)
- **Password Visibility** - Toggle for password fields
- **Auth Routing** - Deploy guardrails for auth flows

## [2026-02-13] - Recent Shipments

### Added
- **Time Tracking UI** - Interface for tracking time on tasks
  - Timer component (start/stop/pause)
  - Time entry list view
  - Daily/weekly time reports
  - Integration with backend API

- **Git Integration UI** - Link tasks to Git commits
  - Display linked commits on task detail
  - GitHub/GitLab connect buttons
  - Commit history view

- **Webhook Configuration UI** - Manage outgoing webhooks
  - Add/edit webhook endpoints
  - Event type selection
  - Delivery logs and retry status

### Fixed
- **OAuth Redirect Loop** - Fixed Google auth infinite redirect
  - Proper state parameter handling
  - Error boundary improvements

## [2026-02-12]

### Added
- **Archive Task UI** - Archive and restore tasks
  - Archive button on task actions
  - Archived tasks filter
  - Restore from archive

- **Automation Rules UI** - Create and manage automation rules
  - Visual rule builder
  - Trigger and action selection
  - Enable/disable rules
