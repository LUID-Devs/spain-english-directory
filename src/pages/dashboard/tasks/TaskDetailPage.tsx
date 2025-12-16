import React from 'react';

// This page serves as a placeholder route for task URLs
// The actual task content is displayed via the TaskModalContext modal overlay
// When the URL matches /dashboard/tasks/:id, the TaskModalProvider automatically opens the modal
const TaskDetailPage = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Loading task...</p>
      </div>
    </div>
  );
};

export default TaskDetailPage;