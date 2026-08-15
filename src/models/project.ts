import { TaskPriority } from "./task";
import { UserRole } from "./user";

export type ProjectStatus = "active" | "on-hold" | "completed";

/** Your standing on a single project, independent of your organization role. */
export type ProjectRole = "manager" | "team-lead" | "member";

/**
 * The trimmed person object the project endpoints populate. `name` is empty
 * and `role` is null when the API sent a bare id instead of a populated object.
 */
export type ProjectPersonModel = {
  id: string;
  name: string;
  role: UserRole | null;
};

export type ProjectTaskStats = {
  total: number;
  completed: number;
  /** Tasks on this project assigned to you. */
  mine: number;
  completionPercentage: number; // 0 - 100
};

export type ProjectModel = {
  id: string;
  name: string;
  code: string;
  status: ProjectStatus;
  priority: TaskPriority;
  startDate: string; // ISO string format
  endDate: string; // ISO string format
  projectRole: ProjectRole;
  memberCount: number;
  taskStats: ProjectTaskStats;
};

/**
 * The effective workflow `GET /projects/:id` resolves — project overrides
 * layered on the organization defaults. Drives which controls the app shows.
 */
export type ProjectWorkflowModel = {
  requireTaskApproval: boolean;
  approverRole: UserRole | null;
  approvers: ProjectPersonModel[];
  defaultPriority: TaskPriority;
  allowMemberTaskCreation: boolean;
  allowMemberTaskDeletion: boolean;
};

export type ProjectDetailsModel = {
  project: ProjectModel & {
    managers: ProjectPersonModel[];
    teamLeads: ProjectPersonModel[];
  };
  workflow: ProjectWorkflowModel;
  taskStats: ProjectTaskStats & { byStatus: Record<string, number> };
};

export type ProjectMemberModel = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  designation: string;
  projectRole: ProjectRole;
  /**
   * Whether the caller may assign a task to this person. Resolved server side
   * against the role hierarchy, so the app never reimplements it.
   */
  assignable: boolean;
};
