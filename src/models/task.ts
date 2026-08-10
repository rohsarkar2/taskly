export type TaskStatus =
  | "to-do"
  | "in-progress"
  | "pending-approval"
  | "completed"
  | "rejected"
  | "blocked";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type TaskModel = {
  id: string;
  title: string;
  description: string; // rich text (HTML)
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // ISO string format
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
  projectId: string;
  creatorId: string;
  assigneeId: string;
  /** null means "anyone who can approve", resolved by the project workflow */
  approverId: string | null;
  commentCount: number;
  /** Set when a task was returned or rejected by an approver */
  rejectionReason?: string;
};

export type CommentModel = {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  createdAt: string; // ISO string format
  parentId: string | null;
  mentionIds: string[];
  edited: boolean;
};

export type ActivityType =
  | "created"
  | "assigned"
  | "status-changed"
  | "submitted"
  | "approved"
  | "rejected"
  | "returned"
  | "commented"
  | "due-date-changed";

export type ActivityModel = {
  id: string;
  taskId: string;
  actorId: string;
  type: ActivityType;
  message: string;
  createdAt: string; // ISO string format
};
