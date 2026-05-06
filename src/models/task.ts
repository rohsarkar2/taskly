export type TaskModel = {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  dueDate: string; // ISO string format
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
  userId: string;
};
