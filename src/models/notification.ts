export type NotificationCategory =
  | "task"
  | "project"
  | "approval"
  | "organization";

export type NotificationModel = {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  createdAt: string; // ISO string format
  read: boolean;
  actorId?: string;
  taskId?: string;
  projectId?: string;
};
