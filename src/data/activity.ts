import { ActivityModel } from "../models/task";

export const activity: ActivityModel[] = [
  {
    id: "a-1",
    taskId: "t-1",
    actorId: "u-4",
    type: "created",
    message: "Sahil Gupta created the task",
    createdAt: "2026-08-06T10:30:00.000Z",
  },
  {
    id: "a-2",
    taskId: "t-1",
    actorId: "u-4",
    type: "assigned",
    message: "Task assigned to Rohan Sarkar",
    createdAt: "2026-08-06T10:32:00.000Z",
  },
  {
    id: "a-3",
    taskId: "t-1",
    actorId: "u-1",
    type: "status-changed",
    message: "Rohan Sarkar changed status to In Progress",
    createdAt: "2026-08-07T09:05:00.000Z",
  },
  {
    id: "a-4",
    taskId: "t-1",
    actorId: "u-2",
    type: "commented",
    message: "Priya Sharma commented on the task",
    createdAt: "2026-08-07T09:12:00.000Z",
  },
  {
    id: "a-5",
    taskId: "t-1",
    actorId: "u-4",
    type: "commented",
    message: "Sahil Gupta mentioned Rohan Sarkar",
    createdAt: "2026-08-09T13:05:00.000Z",
  },
  {
    id: "a-6",
    taskId: "t-2",
    actorId: "u-1",
    type: "created",
    message: "Rohan Sarkar created the task",
    createdAt: "2026-08-03T09:15:00.000Z",
  },
  {
    id: "a-7",
    taskId: "t-2",
    actorId: "u-1",
    type: "status-changed",
    message: "Rohan Sarkar changed status to In Progress",
    createdAt: "2026-08-10T08:05:00.000Z",
  },
  {
    id: "a-8",
    taskId: "t-5",
    actorId: "u-1",
    type: "created",
    message: "Rohan Sarkar created the task",
    createdAt: "2026-07-30T09:00:00.000Z",
  },
  {
    id: "a-9",
    taskId: "t-5",
    actorId: "u-1",
    type: "status-changed",
    message: "Rohan Sarkar changed status to In Progress",
    createdAt: "2026-08-04T10:00:00.000Z",
  },
  {
    id: "a-10",
    taskId: "t-5",
    actorId: "u-1",
    type: "submitted",
    message: "Rohan Sarkar submitted the task for approval",
    createdAt: "2026-08-09T16:45:00.000Z",
  },
  {
    id: "a-11",
    taskId: "t-21",
    actorId: "u-1",
    type: "submitted",
    message: "Rohan Sarkar submitted the task for approval",
    createdAt: "2026-08-09T16:00:00.000Z",
  },
  {
    id: "a-12",
    taskId: "t-21",
    actorId: "u-2",
    type: "rejected",
    message: "Priya Sharma returned the task for changes",
    createdAt: "2026-08-09T17:30:00.000Z",
  },
  {
    id: "a-13",
    taskId: "t-7",
    actorId: "u-1",
    type: "submitted",
    message: "Rohan Sarkar submitted the task for approval",
    createdAt: "2026-07-27T14:00:00.000Z",
  },
  {
    id: "a-14",
    taskId: "t-7",
    actorId: "u-2",
    type: "approved",
    message: "Priya Sharma approved the task",
    createdAt: "2026-07-27T17:30:00.000Z",
  },
];

export const getActivityByTaskId = (taskId: string) =>
  activity
    .filter((item) => item.taskId === taskId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

/** Most recent activity across every task the user can see, newest first. */
export const recentActivity = [...activity].sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
);
