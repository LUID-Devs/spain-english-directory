import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  archived?: boolean;
  archivedAt?: string;
  isFavorited?: boolean;
  statistics?: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    progress: number;
    memberCount: number;
    status: string;
  };
  teamMembers?: {
    userId: number;
    username: string;
    profilePictureUrl?: string;
  }[];
  taskCount?: number;
}

export enum Status {
  ToDo = "To Do",
  WorkInProgress = "Work In Progress",
  UnderReview = "Under Review",
  Completed = "Completed",
}

export enum Priority {
  Urgent = "Urgent",
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Backlog = "Backlog",
}

export interface User {
  userId: number;
  username: string;
  email: string;
  profilePictureUrl?: string;
  cognitoId?: string;
  teamId?: number;
}

export interface Attachment {
  id: number;
  fileURL: string;
  fileName: string;
  taskId: number;
  uploadedByUserId: number;
}

export interface Comment {
  id: number;
  text: string;
  taskId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user: {
    userId: number;
    username: string;
    email: string;
    profilePictureUrl?: string;
  };
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  points?: number;
  projectId: number;
  authorUserId?: number;
  assignedUserId?: number;

  author?: User;
  assignee?: User;
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface SearchResults {
  tasks?: Task[];
  projects?: Project[];
  users?: User[];
}

export interface Team {
  teamId: number;
  teamName: string;
  productOwnerUserId?: number;
  projectManagerUserId?: number;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers) => {
      console.log('API Request headers prepared, baseUrl:', process.env.NEXT_PUBLIC_API_BASE_URL);
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: ["Projects", "Tasks", "Users", "Teams", "Comments"],
  endpoints: (build) => ({
    getAuthUser: build.query({
      query: (userSub: string) => `users/${userSub}`,
      providesTags: ["Users"],
    }),
    getProjects: build.query<Project[], { archived?: boolean; favorites?: boolean; userId?: number; status?: string }>({
      query: ({ archived, favorites, userId, status } = {}) => {
        const params = new URLSearchParams();
        if (archived !== undefined) params.append('archived', archived.toString());
        if (favorites !== undefined) params.append('favorites', favorites.toString());
        if (userId !== undefined) params.append('userId', userId.toString());
        if (status !== undefined) params.append('status', status);
        
        const queryString = params.toString();
        return `projects${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: [{ type: "Projects" }],
    }),
    createProject: build.mutation<Project, Partial<Project>>({
      query: (project) => ({
        url: "projects",
        method: "POST",
        body: project,
      }),
      invalidatesTags: ["Projects"],
    }),
    updateProject: build.mutation<Project, { id: string; project: Partial<Project> }>({
      query: ({ id, project }) => ({
        url: `projects/${id}`,
        method: "PUT",
        body: project,
      }),
      invalidatesTags: ["Projects"],
    }),
    deleteProject: build.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `projects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Projects"],
    }),
    archiveProject: build.mutation<Project, string>({
      query: (id) => ({
        url: `projects/${id}/archive`,
        method: "PATCH",
      }),
      invalidatesTags: ["Projects"],
    }),
    unarchiveProject: build.mutation<Project, string>({
      query: (id) => ({
        url: `projects/${id}/unarchive`,
        method: "PATCH",
      }),
      invalidatesTags: ["Projects"],
    }),
    favoriteProject: build.mutation<{ message: string }, { id: string; userId: number }>({
      query: ({ id, userId }) => ({
        url: `projects/${id}/favorite`,
        method: "POST",
        body: { userId },
      }),
      invalidatesTags: ["Projects"],
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(api.util.invalidateTags(["Projects"]));
        } catch {
        }
      },
    }),
    unfavoriteProject: build.mutation<{ message: string }, { id: string; userId: number }>({
      query: ({ id, userId }) => ({
        url: `projects/${id}/favorite`,
        method: "DELETE",
        body: { userId },
      }),
      invalidatesTags: ["Projects"],
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(api.util.invalidateTags(["Projects"]));
        } catch {
        }
      },
    }),
    getTasks: build.query<Task[], { projectId: number }>({
      query: ({ projectId }) => `tasks?projectId=${projectId}`,
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks" as const, id }))
          : [{ type: "Tasks" as const }],
    }),
    getTask: build.query<Task, number>({
      query: (taskId) => `tasks/${taskId}`,
      providesTags: (result, error, taskId) => [{ type: "Tasks", id: taskId }],
    }),
    getTasksByUser: build.query<Task[], number>({
      query: (userId) => `tasks/user/${userId}`,
      providesTags: (result, error, userId) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks", id }))
          : [{ type: "Tasks", id: userId }],
    }),
    createTask: build.mutation<Task, Partial<Task>>({
      query: (task) => ({
        url: "tasks",
        method: "POST",
        body: task,
      }),
      invalidatesTags: ["Tasks"],
    }),
    updateTask: build.mutation<Task, { taskId: number; task: Partial<Task> }>({
      query: ({ taskId, task }) => ({
        url: `tasks/${taskId}`,
        method: "PUT",
        body: task,
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
        "Tasks",
      ],
    }),
    deleteTask: build.mutation<{ message: string }, number>({
      query: (taskId) => ({
        url: `tasks/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tasks"],
    }),
    getTaskComments: build.query<Comment[], number>({
      query: (taskId) => `tasks/${taskId}/comments`,
      providesTags: (result, error, taskId) =>
        result
          ? result.map(({ id }) => ({ type: "Comments" as const, id }))
          : [{ type: "Comments" as const, id: taskId }],
    }),
    createComment: build.mutation<Comment, { taskId: number; text: string; userId: number }>({
      query: ({ taskId, text, userId }) => ({
        url: `tasks/${taskId}/comments`,
        method: "POST",
        body: { text, userId },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Comments", id: taskId },
        "Comments",
      ],
    }),
    updateComment: build.mutation<Comment, { commentId: number; text: string; userId: number }>({
      query: ({ commentId, text, userId }) => ({
        url: `comments/${commentId}`,
        method: "PUT",
        body: { text, userId },
      }),
      invalidatesTags: (result, error, { commentId }) => [
        { type: "Comments", id: commentId },
        "Comments",
      ],
    }),
    deleteComment: build.mutation<{ message: string }, { commentId: number; userId: number }>({
      query: ({ commentId, userId }) => ({
        url: `comments/${commentId}`,
        method: "DELETE",
        body: { userId },
      }),
      invalidatesTags: ["Comments"],
    }),
    updateTaskStatus: build.mutation<Task, { taskId: number; status: string }>({
      query: ({ taskId, status }) => ({
        url: `tasks/${taskId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
      ],
    }),
    getUsers: build.query<User[], void>({
      query: () => "users",
      providesTags: ["Users"],
    }),
    getTeams: build.query<Team[], void>({
      query: () => "teams",
      providesTags: ["Teams"],
    }),
    search: build.query<SearchResults, string>({
      query: (query) => `search?query=${query}`,
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useArchiveProjectMutation,
  useUnarchiveProjectMutation,
  useFavoriteProjectMutation,
  useUnfavoriteProjectMutation,
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskStatusMutation,
  useGetTaskCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useSearchQuery,
  useGetUsersQuery,
  useGetTeamsQuery,
  useGetTasksByUserQuery,
  useGetAuthUserQuery,
} = api;
