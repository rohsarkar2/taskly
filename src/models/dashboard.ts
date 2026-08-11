import { ProjectStatus } from "./project";
import { ActivityModel, TaskPriority, TaskStatus } from "./task";

/** Counters `GET /dashboard` returns in one round trip. */
export type DashboardSummaryModel = {
  assignedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  returnedTasks: number;
  completedTasks: number;
  rejectedTasks: number;
  overdueTasks: number;
  /** Your own tasks awaiting review. */
  pendingApprovals: number;
  /** Tasks waiting on you as an approver. */
  awaitingMyApproval: number;
  openTasks: number;
  projects: number;
  unreadNotifications: number;
  completionRate: number; // 0 - 100
};

/**
 * The trimmed task the dashboard endpoints return. Narrower than TaskModel —
 * there is no description, assignee or comment count in this payload.
 */
export type DashboardTaskModel = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // ISO string format
  project: { id: string; name: string; code: string } | null;
};

export type DashboardModel = {
  summary: DashboardSummaryModel;
  todaysTasks: DashboardTaskModel[];
  recentActivity: ActivityModel[];
};

/** One row of `GET /dashboard/workload` — your open work in a single project. */
export type WorkloadEntryModel = {
  projectId: string;
  projectName: string;
  projectStatus: ProjectStatus;
  total: number;
  open: number;
  completed: number;
};
