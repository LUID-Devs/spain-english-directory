// Types (moved from old api.ts)
export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  archived?: boolean;
  archivedAt?: string;
  createdAt?: string;
  updatedAt?: string;
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
  Archived = "Archived",
}

export interface TaskStatus {
  id: number;
  name: string;
  color?: string;
  order: number;
  isDefault: boolean;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

export enum Priority {
  Urgent = "Urgent",
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Backlog = "Backlog",
}

export enum TaskType {
  Feature = "Feature",
  Bug = "Bug",
  Chore = "Chore",
}

export interface SavedView {
  id: number;
  name: string;
  projectId: number;
  userId: number;
  organizationId: number;
  filters: {
    priority?: string | null;
    status?: string | null;
    assigneeId?: number | null;
    searchQuery?: string | null;
  };
  isDefault: boolean;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  userId: number;
  username: string;
  email: string;
  profilePictureUrl?: string;
  cognitoId?: string;
  teamId?: number;
  role?: string;
}

export interface UserWithStats extends User {
  teamName?: string;
  taskStats: {
    authored: number;
    assigned: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  activityStats: {
    totalComments: number;
    totalAttachments: number;
    lastActivity: string | null;
  };
}

export interface Agent {
  id: number;
  name: string;
  displayName?: string;
  role?: string;
  status: 'active' | 'inactive' | 'busy';
  lastHeartbeat?: string;
  currentTaskId?: number;
  currentTask?: {
    id: number;
    title: string;
    status: string;
  };
  _count?: {
    assignedTasks: number;
    notifications: number;
  };
}

export interface Attachment {
  id: number;
  fileURL: string;
  fileName: string;
  taskId: number;
  uploadedById: number;
  uploadedBy: {
    userId: number;
    username: string;
    email: string;
  };
}

export interface Comment {
  id: number;
  text: string;
  imageUrl?: string;
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
  descriptionImageUrl?: string;
  status?: Status;
  priority?: Priority;
  taskType?: TaskType;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  points?: number;
  order?: number;
  projectId: number;
  authorUserId?: number;
  assignedUserId?: number;
  archivedAt?: string;
  triaged?: boolean;

  author?: User;
  assignee?: User;
  project?: {
    id: number;
    name: string;
  };
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface SearchResults {
  tasks?: Task[];
  projects?: Project[];
  users?: User[];
}

export interface SearchSuggestion {
  type: 'task' | 'project' | 'user';
  id: number;
  title: string;
  subtitle: string;
}

export interface Team {
  id: number;
  teamName: string;
  productOwnerUserId?: number;
  projectManagerUserId?: number;
  productOwnerUsername?: string;
  projectManagerUsername?: string;
  memberCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// AI Task Parsing Types
export interface ParsedTaskData {
  title: string;
  description: string | null;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low' | 'Backlog' | null;
  dueDate: string | null;
  assignee: string | null;
  tags: string | null;
  confidence: {
    title: number;
    priority: number;
    dueDate: number;
    assignee: number;
    tags: number;
  };
}

export interface AIParseTaskResponse {
  success: boolean;
  data?: ParsedTaskData;
  error?: {
    message: string;
    code: string;
    required?: number;
    available?: number;
  };
  creditsUsed?: number;
  remainingCredits?: number;
  processingTime?: number;
}

export interface AIStatusResponse {
  success: boolean;
  data?: {
    available: boolean;
    features: {
      parseTask: {
        available: boolean;
        creditCost: number;
        description: string;
        maxInputLength: number;
      };
    };
  };
}

// ==================== API SERVICE CLASS ====================

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Get Cognito access token and ID token if available
    const authHeader: Record<string, string> = {};
    try {
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();

      if (session?.tokens?.accessToken) {
        authHeader['Authorization'] = `Bearer ${session.tokens.accessToken}`;
      }

      // Also send ID token which contains email and other user attributes
      if (session?.tokens?.idToken) {
        authHeader['X-ID-Token'] = `${session.tokens.idToken}`;
      }
    } catch (error) {
      // No Cognito session available, continue without token (will use session cookies)
    }

    // Check if body is FormData - don't set Content-Type for FormData
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
      ...authHeader,
      ...(options.headers as Record<string, string>),
    };

    // Only set Content-Type for non-FormData requests
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    // Add organization context header if available in localStorage
    const activeOrgId = localStorage.getItem('activeOrganizationId');
    if (activeOrgId) {
      headers['X-Organization-Id'] = activeOrgId;
    }

    const config: RequestInit = {
      credentials: 'include',
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Use default error message
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error && error.message === 'Authentication required') {
        throw error;
      }
      throw error;
    }
  }

  // ==================== ANALYTICS API ====================

  async getTeamVelocity(teamId: number, cycles?: number): Promise<TeamVelocityResponse> {
    const params = new URLSearchParams();
    if (cycles) params.append('cycles', cycles.toString());
    return this.request<TeamVelocityResponse>(`/api/analytics/teams/${teamId}/velocity?${params.toString()}`);
  }

  async getTeamCycleTime(teamId: number, periodDays?: number): Promise<TeamCycleTimeResponse> {
    const params = new URLSearchParams();
    if (periodDays) params.append('period', periodDays.toString());
    return this.request<TeamCycleTimeResponse>(`/api/analytics/teams/${teamId}/cycle-time?${params.toString()}`);
  }

  async getTeamThroughput(teamId: number, periodDays?: number, groupBy?: 'day' | 'week' | 'month'): Promise<TeamThroughputResponse> {
    const params = new URLSearchParams();
    if (periodDays) params.append('period', periodDays.toString());
    if (groupBy) params.append('groupBy', groupBy);
    return this.request<TeamThroughputResponse>(`/api/analytics/teams/${teamId}/throughput?${params.toString()}`);
  }

  async getTeamAnalyticsSummary(teamId: number): Promise<TeamAnalyticsSummaryResponse> {
    return this.request<TeamAnalyticsSummaryResponse>(`/api/analytics/teams/${teamId}/summary`);
  }

  // ==================== BULK OPERATIONS ====================

  async bulkUpdateTasks(taskIds: number[], updates: Partial<Task>): Promise<{ success: boolean; updatedCount: number }> {
    return this.request<{ success: boolean; updatedCount: number }>('/api/tasks/bulk-update', {
      method: 'PATCH',
      body: JSON.stringify({ taskIds, updates }),
    });
  }

  async bulkDeleteTasks(taskIds: number[]): Promise<{ success: boolean; deletedCount: number }> {
    return this.request<{ success: boolean; deletedCount: number }>('/api/tasks/bulk-delete', {
      method: 'DELETE',
      body: JSON.stringify({ taskIds }),
    });
  }

  // ==================== MISSING API METHODS (TASK #602 FIX) ====================

  async getProjects(filters: { organizationId?: number; archived?: boolean } = {}): Promise<Project[]> {
    const params = new URLSearchParams();
    if (filters.organizationId) params.append('organizationId', filters.organizationId.toString());
    if (filters.archived !== undefined) params.append('archived', filters.archived.toString());
    const queryString = params.toString();
    return this.request<Project[]>(`/api/projects${queryString ? `?${queryString}` : ''}`);
  }

  async getTasksByUser(userId: number): Promise<Task[]> {
    return this.request<Task[]>(`/api/tasks/user/${userId}`);
  }

  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/api/users');
  }

  async getUnreadNotificationCount(): Promise<{ success: boolean; unreadCount: number }> {
    const response = await this.request<{ count: number }>('/api/notifications/unread-count');
    return { success: true, unreadCount: response.count };
  }
}

export const apiService = new ApiService();

// ==================== GOAL TYPES ====================

export interface Goal {
  id: number;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  progress: number;
  calculatedProgress?: number; // Computed on backend to handle division by zero for goals with no linked tasks
  startDate?: string;
  targetDate?: string;
  completedAt?: string;
  organizationId: number;
  projectId?: number;
  parentGoalId?: number | null; // Parent goal for hierarchy (null = top-level)
  templateId?: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  // Permission fields (Task #264)
  goalType: 'company' | 'team' | 'individual';
  visibility: 'public' | 'team' | 'private';
  teamId?: number;
  team?: {
    id: number;
    teamName: string;
  };
  project?: {
    id: number;
    name: string;
  };
  creator?: {
    userId: number;
    username: string;
    profilePictureUrl?: string;
  };
  parentGoal?: {
    id: number;
    title: string;
  } | null;
  childGoals?: {
    id: number;
    title: string;
    status: string;
    progress: number;
  }[];
  template?: {
    id: number;
    name: string;
  };
  _count?: {
    linkedTasks: number;
    childGoals: number;
  };
  // Goal-Cycle Integration (Task #267)
  linkedCycles?: {
    cycle: {
      id: number;
      name: string;
      status: string;
      startDate: string;
      endDate: string;
    };
    contributionWeight: number;
  }[];
}

export interface GoalTemplate {
  id: number;
  name: string;
  description?: string;
  category: 'general' | 'sprint' | 'quarterly' | 'project' | 'personal';
  defaultTitle?: string;
  defaultDescription?: string;
  defaultPriority: 'urgent' | 'high' | 'medium' | 'low';
  defaultDurationDays?: number;
  taskTemplates?: Array<{
    title: string;
    description?: string;
    priority: string;
    estimatedHours?: number;
  }>;
  isSystem: boolean;
  isActive: boolean;
  organizationId?: number;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== GOAL-CYCLE INTEGRATION TYPES (Task #267) ====================

export interface LinkedCycle {
  id: number;
  name: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  contributionWeight: number;
  progress: number;
  totalTasks: number;
  completedTasks: number;
}

export interface LinkedGoal {
  id: number;
  title: string;
  status: 'active' | 'completed' | 'archived';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  progress: number;
  targetDate?: string;
  goalType: 'company' | 'team' | 'individual';
  visibility: 'public' | 'team' | 'private';
  contributionWeight: number;
}

// ==================== WORKLOAD TYPES ====================

export interface WorkloadSettings {
  capacityMetric: 'task_count' | 'time_estimate' | 'story_points';
  defaultCapacity: number;
  warningThreshold: number;
  dangerThreshold: number;
  showUnassigned: boolean;
  showOutOfOffice: boolean;
}

export interface WorkloadTask {
  id: number;
  title: string;
  status: string;
  priority: string;
  projectName?: string;
  dueDate?: string;
}

export interface WorkloadMember {
  memberId: number;
  username: string;
  email: string;
  profilePictureUrl?: string;
  role: string;
  capacity: number;
  currentLoad: number;
  capacityPercent: number;
  status: 'green' | 'yellow' | 'red';
  isOutOfOffice: boolean;
  outOfOfficeUntil?: string;
  hasConflict: boolean;
  tasks: WorkloadTask[];
}

export interface WorkloadAlert {
  type: 'overloaded' | 'warning' | 'out_of_office_conflict' | 'unassigned';
  severity: 'danger' | 'warning' | 'info';
  message: string;
  userId?: number;
  username?: string;
  currentLoad?: number;
  capacity?: number;
  outOfOfficeUntil?: string;
  count?: number;
}

export interface TeamWorkloadResponse {
  success: boolean;
  settings: WorkloadSettings;
  members: WorkloadMember[];
  unassigned: {
    count: number;
    tasks: WorkloadTask[];
  };
  summary: {
    totalMembers: number;
    overloadedMembers: number;
    warningMembers: number;
    outOfOfficeMembers: number;
    unassignedTasks: number;
    conflicts: number;
  };
}

export interface WorkloadAlertsResponse {
  success: boolean;
  alerts: WorkloadAlert[];
  summary: {
    dangerCount: number;
    warningCount: number;
    infoCount: number;
  };
}

// ==================== USER NOTIFICATIONS TYPES ====================

export interface UserNotification {
  id: number;
  userId: number;
  organizationId: number;
  type: 'workload_overload' | 'workload_warning' | 'out_of_office_conflict' | 'task_reassigned' | 'task_assigned' | 'unassigned_tasks' | 'cycle_deadline' | string;
  title: string;
  message: string;
  taskId?: number;
  triggeredByUserId?: number;
  read: boolean;
  readAt?: string;
  dismissed: boolean;
  dismissedAt?: string;
  delivered: boolean;
  deliveredAt?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  task?: {
    id: number;
    title: string;
    status: string | null;
    priority: string | null;
  };
  triggeredBy?: {
    userId: number;
    username: string;
    profilePictureUrl?: string;
  };
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  workloadAlerts: boolean;
  taskAssignmentAlerts: boolean;
  dailyDigest: boolean;
  weeklyDigest: boolean;
}

// ==================== CYCLE TYPES ====================

export type CycleStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface Cycle {
  id: number;
  teamId: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: CycleStatus;
  cooldownEnabled: boolean;
  autoCreated?: boolean;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
}

export interface CycleWithDetails extends Cycle {
  tasks: {
    id: number;
    title: string;
    status: string;
    priority: string;
    assignedUserId?: number;
    points?: number;
  }[];
  team: {
    id: number;
    teamName: string;
    cyclesEnabled: boolean;
  };
  stats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    totalPoints: number;
  };
}

export interface CycleSettings {
  cyclesEnabled: boolean;
  cycleDurationWeeks: number;
  cycleStartDay: string;
  cooldownDays: number;
  upcomingCyclesCount: number;
}

export interface OverlappingCycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
}

export interface CycleOverlapError {
  message: string;
  overlappingCycles: OverlappingCycle[];
}

// ==================== GIT LINK TYPES ====================

export interface GitLink {
  id: number;
  taskId: number;
  type: 'commit' | 'pull_request';
  ref: string;
  title: string;
  message?: string;
  url: string;
  authorName: string;
  authorUsername?: string;
  authorAvatar?: string;
  repository: string;
  branch?: string;
  prNumber?: number;
  prState?: string;
  prMergedAt?: string;
  integrationConfigId?: number;
  gitCreatedAt: string;
  createdAt: string;
}

// ==================== TIME TRACKING TYPES ====================

export interface TimeLog {
  id: number;
  taskId: number;
  userId: number;
  startedAt: string;
  endedAt?: string;
  durationMinutes?: number;
  durationFormatted?: string;
  description?: string;
  isRunning: boolean;
  source?: string;
  createdAt: string;
  user?: {
    userId: number;
    username: string;
    profilePictureUrl?: string;
  };
  task?: {
    id: number;
    title: string;
    projectId: number;
    project?: { name: string };
  };
}

export interface TimeEstimate {
  id: number;
  taskId: number;
  estimatedMinutes: number;
  estimatedFormatted: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    userId: number;
    username: string;
    profilePictureUrl?: string;
  };
}

export interface ActiveTimer {
  hasActiveTimer: boolean;
  timer?: {
    id: number;
    taskId: number;
    task?: {
      id: number;
      title: string;
      projectId: number;
      project?: { name: string };
    };
    startedAt: string;
    elapsedMinutes: number;
    elapsedFormatted: string;
    description?: string;
  };
}

export interface TimeLogsResponse {
  taskId: number;
  logs: TimeLog[];
  summary: {
    totalMinutes: number;
    totalFormatted: string;
    count: number;
  };
}

export interface ProjectTimeReport {
  projectId: number;
  dateRange: { startDate?: string; endDate?: string };
  summary: {
    totalMinutes: number;
    totalFormatted: string;
    logCount: number;
  };
  byUser: Array<{
    user: { userId: number; username: string; profilePictureUrl?: string };
    totalMinutes: number;
    totalFormatted: string;
    logCount: number;
  }>;
  byTask: Array<{
    task: { id: number; title: string; status: string };
    totalMinutes: number;
    totalFormatted: string;
    logCount: number;
  }>;
  logs: TimeLog[];
}

// ==================== AUTOMATION TYPES ====================

export interface AutomationTriggerType {
  type: string;
  name: string;
  description: string;
}

export interface AutomationActionType {
  type: string;
  name: string;
  description: string;
}

export interface TriggerConfig {
  projectId?: number;
  statusFrom?: string;
  statusTo?: string;
  priority?: string;
  assignedToUserId?: number;
  assignedToAgentId?: number;
  dueDateHours?: number;
}

export interface ActionConfig {
  // For notification.send
  message?: string;
  recipientAgentIds?: number[];
  notifyAssigneeAgent?: boolean;
  notifyAuthorAgent?: boolean;
  
  // For webhook.call
  webhookUrl?: string;
  headers?: Record<string, string>;
  
  // For task.status.update
  newStatus?: string;
  
  // For task.assign
  assignToAgentId?: number;
  
  // For task.comment.add
  commentText?: string;
  commentAsAgentId?: number;
  
  // For integration.send
  integrationConfigId?: number;
}

export interface AutomationRule {
  id: number;
  organizationId: number;
  name: string;
  description?: string;
  triggerType: string;
  triggerConfig: TriggerConfig;
  actionType: string;
  actionConfig: ActionConfig;
  isActive: boolean;
  executionCount: number;
  lastExecutedAt?: string;
  errorCount: number;
  lastError?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationRuleWithExecutions extends AutomationRule {
  executions: AutomationExecutionSummary[];
}

export interface AutomationExecutionSummary {
  id: number;
  status: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
  durationMs?: number;
}

export interface AutomationExecution {
  id: number;
  ruleId: number;
  taskId?: number;
  triggerEvent: string;
  triggerPayload: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  result?: Record<string, any>;
  error?: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  rule: {
    name: string;
    triggerType: string;
    actionType: string;
  };
}

export interface CreateAutomationRuleRequest {
  name: string;
  description?: string;
  triggerType: string;
  triggerConfig: TriggerConfig;
  actionType: string;
  actionConfig: ActionConfig;
  organizationId: number;
}

// ==================== TIMELINE TYPES ====================

export type TimelineEventType = 
  | 'task_assigned'
  | 'task_started'
  | 'task_completed'
  | 'status_changed'
  | 'commit_pushed'
  | 'pr_opened'
  | 'pr_merged'
  | 'pr_closed'
  | 'build_started'
  | 'build_completed'
  | 'deploy_started'
  | 'deploy_completed'
  | 'comment_added'
  | 'agent_handoff';

export type TimelineEventCategory = 'task' | 'git' | 'deployment' | 'ci' | 'system';

export type ActorType = 'agent' | 'user' | 'system' | 'git';

export interface TimelineEvent {
  id: number;
  organizationId: number;
  taskId?: number;
  projectId?: number;
  eventType: TimelineEventType;
  eventCategory: TimelineEventCategory;
  actorType: ActorType;
  actorId?: number;
  actorName: string;
  actorAvatar?: string;
  title: string;
  description?: string;
  taskLink?: string;
  prLink?: string;
  commitLink?: string;
  deploymentLink?: string;
  commitSha?: string;
  prNumber?: number;
  branchName?: string;
  status?: 'success' | 'failure' | 'pending' | 'in_progress';
  metadata: Record<string, any>;
  occurredAt: string;
  createdAt: string;
}

export interface TimelineStats {
  totalEvents: number;
  eventsByCategory: Record<TimelineEventCategory, number>;
  eventsByType: Record<string, number>;
  topActors: { actorName: string; count: number }[];
}

// ==================== ROADMAP TYPES ====================

export interface RoadmapProject {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  healthStatus: 'on_track' | 'at_risk' | 'delayed' | 'unknown';
  healthReason?: string;
  taskStats: {
    total: number;
    completed: number;
  };
  milestones: Milestone[];
  dependsOn: ProjectDependency[];
}

export interface Milestone {
  id: number;
  organizationId: number;
  projectId?: number;
  project?: {
    id: number;
    name: string;
  };
  name: string;
  description?: string;
  targetDate: string;
  completedAt?: string;
  status: 'upcoming' | 'at_risk' | 'missed' | 'completed';
  healthStatus: 'on_track' | 'at_risk' | 'delayed';
  healthReason?: string;
  autoCalculate: boolean;
  progress: number;
  linkedTaskCount: number;
  completedTaskCount: number;
  linkedTasks?: {
    id: number;
    title: string;
    status: string;
  }[];
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDependency {
  id: number;
  dependentProjectId: number;
  dependentProject?: {
    id: number;
    name: string;
    startDate?: string;
    endDate?: string;
  };
  dependencyProjectId: number;
  dependencyProject?: {
    id: number;
    name: string;
    startDate?: string;
    endDate?: string;
  };
  dependencyType: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lagDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMilestoneRequest {
  organizationId: number;
  projectId?: number;
  name: string;
  description?: string;
  targetDate: string;
  autoCalculate?: boolean;
}

export interface CreateDependencyRequest {
  dependentProjectId: number;
  dependencyProjectId: number;
  dependencyType?: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lagDays?: number;
}

// ==================== ANALYTICS TYPES ====================

export interface VelocityCycle {
  cycleId: number;
  cycleName: string;
  startDate: string;
  endDate: string;
  status: string;
  completedTasks: number;
  totalPoints: number;
  averagePointsPerTask: number;
}

export interface TeamVelocityResponse {
  success: boolean;
  teamId: number;
  cyclesAnalyzed: number;
  averageVelocity: {
    tasksPerCycle: number;
    pointsPerCycle: number;
  };
  velocityByCycle: VelocityCycle[];
}

export interface CycleTimeByPriority {
  priority: string;
  count: number;
  averageCycleTime: number;
  min: number;
  max: number;
}

export interface CycleTimeTask {
  taskId: number;
  cycleTimeDays: number;
  points?: number;
  priority?: string;
  taskType?: string;
  startDate?: string;
  completedAt: string;
}

export interface TeamCycleTimeResponse {
  success: boolean;
  teamId: number;
  periodDays: number;
  tasksAnalyzed: number;
  averageCycleTimeDays: number;
  cycleTimeByPriority: CycleTimeByPriority[];
  tasks: CycleTimeTask[];
}

export interface ThroughputDataPoint {
  period: string;
  completedTasks: number;
  totalPoints: number;
  taskIds: number[];
}

export interface TeamThroughputResponse {
  success: boolean;
  teamId: number;
  periodDays: number;
  groupBy: string;
  totalTasks: number;
  totalPoints: number;
  averagePerPeriod: number;
  periodsAnalyzed: number;
  throughputData: ThroughputDataPoint[];
}

export interface ActiveCycleStats {
  cycleId: number;
  cycleName: string;
  startDate: string;
  endDate: string;
  totalTasks: number;
  completedTasks: number;
  totalPoints: number;
  completedPoints: number;
}

export interface WorkloadByUser {
  userId: number;
  username: string;
  taskCount: number;
}

export interface TeamAnalyticsSummaryResponse {
  success: boolean;
  team: {
    id: number;
    name: string;
    memberCount: number;
    cyclesEnabled: boolean;
  };
  summary: {
    activeCycle: ActiveCycleStats | null;
    recentThroughput: {
      period: string;
      completedTasks: number;
      averagePerDay: number;
    };
    cycleTime: {
      period: string;
      averageDays: number;
      tasksAnalyzed: number;
    };
    currentWorkload: {
      activeTasks: number;
      byUser: WorkloadByUser[];
    };
  };
}
