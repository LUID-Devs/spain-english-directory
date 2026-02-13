# Changelog

All notable changes to TaskLuid Web will be documented in this file.

## [Unreleased]

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
