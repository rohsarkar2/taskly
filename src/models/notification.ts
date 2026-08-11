/** Coarse grouping used by the tabs and the row icons. */
export type NotificationCategory =
  | "task"
  | "project"
  | "approval"
  | "organization";

/** What a notification points at, used to deep link into the right screen. */
export type NotificationEntityType = "task" | "project" | "employee" | "other";

export type NotificationModel = {
  id: string;
  /** The API's own type, e.g. `task_assigned`. Kept for filtering. */
  type: string;
  category: NotificationCategory;
  title: string;
  body: string;
  createdAt: string; // ISO string format
  read: boolean;
  entityType: NotificationEntityType;
  entityId?: string;
  /** Convenience views of `entityId`, resolved from `entityType`. */
  taskId?: string;
  projectId?: string;
};
