export type TaskStatus =
  | "to-do"
  | "in-progress"
  | "pending-approval"
  | "completed"
  | "rejected"
  | "blocked";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

/** The trimmed person object the task endpoints populate. */
export type TaskPersonModel = {
  id: string;
  name: string;
  image: string;
};

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
  project: { id: string; name: string; code: string } | null;
  creator: TaskPersonModel | null;
  assignee: TaskPersonModel | null;
  /** Populated on the detail endpoint; empty on list responses. */
  approvers: TaskPersonModel[];
  /** Resolved from the project workflow — gates the complete / approve flow. */
  requiresApproval: boolean;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  startedAt?: string;
  submittedAt?: string;
  completedAt?: string;
  assignmentAcceptedAt?: string;
  attachments: AttachmentModel[];
  commentCount: number;
  /** Set when a task was returned or rejected by an approver */
  rejectionReason?: string;
};

/** Sent alongside `GET /tasks/:id` so the app can hide controls it can't use. */
export type TaskPermissionsModel = {
  canEdit: boolean;
  canDelete: boolean;
  canUpdateStatus: boolean;
};

/** A person the @-mention picker can offer, from `/tasks/:id/mentionable`. */
export type MentionableUserModel = {
  id: string;
  name: string;
  email: string;
  avatar: string;
};

export type CommentModel = {
  id: string;
  taskId: string;
  parentId: string | null;
  content: string;
  author: TaskPersonModel | null;
  mentions: MentionableUserModel[];
  replyCount: number;
  edited: boolean;
  createdAt: string; // ISO string format
  /** Populated on top-level comments, oldest first. Replies are one level. */
  replies: CommentModel[];
};

export type AttachmentModel = {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedById: string;
  uploadedByName: string;
  createdAt: string; // ISO string format
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
  taskTitle?: string;
  actorName: string;
  type: ActivityType;
  message: string;
  createdAt: string; // ISO string format
};
