import React from 'react';
import { useParams } from 'react-router-dom';

const TaskDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container h-full w-[100%] bg-gray-100 bg-transparent p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Task Detail</h1>
      <p className="text-gray-600 dark:text-gray-300">Task ID: {id}</p>
      <p className="text-gray-600 dark:text-gray-300">This is the task detail page. Content to be migrated from Next.js pages.</p>
    </div>
  );
};

export default TaskDetailPage;