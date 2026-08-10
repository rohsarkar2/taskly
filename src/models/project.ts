export type ProjectStatus = "active" | "on-hold" | "completed";

export type ProjectTaskCounts = {
  total: number;
  toDo: number;
  inProgress: number;
  pendingApproval: number;
  completed: number;
};

export type ProjectModel = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number; // 0 - 100
  color: string;
  dueDate: string; // ISO string format
  createdAt: string; // ISO string format
  memberIds: string[];
  taskCounts: ProjectTaskCounts;
  /** Roles allowed to approve tasks in this project. Backend-driven later. */
  approverRoles: ("team-lead" | "manager")[];
};
