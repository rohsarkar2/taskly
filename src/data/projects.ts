import { ProjectModel } from "../models/project";
import Colors from "../configs/Colors";

export const projects: ProjectModel[] = [
  {
    id: "p-1",
    name: "Mobile App",
    description:
      "Taskly mobile client for iOS and Android. Covers authentication, project browsing, the task workflow and push notifications.",
    status: "active",
    progress: 72,
    color: Colors.primary,
    dueDate: "2026-09-30T00:00:00.000Z",
    createdAt: "2026-04-02T09:00:00.000Z",
    memberIds: ["u-1", "u-2", "u-3", "u-4", "u-5", "u-6", "u-7", "u-8"],
    taskCounts: {
      total: 8,
      toDo: 2,
      inProgress: 2,
      pendingApproval: 2,
      completed: 2,
    },
    approverRoles: ["team-lead", "manager"],
  },
  {
    id: "p-2",
    name: "Website Revamp",
    description:
      "Rebuild of the marketing site with a new design system, a headless CMS and a much faster first paint.",
    status: "active",
    progress: 45,
    color: "#3B82F6",
    dueDate: "2026-10-10T00:00:00.000Z",
    createdAt: "2026-05-19T09:00:00.000Z",
    memberIds: ["u-1", "u-5", "u-7", "u-8", "u-3"],
    taskCounts: {
      total: 5,
      toDo: 2,
      inProgress: 1,
      pendingApproval: 1,
      completed: 1,
    },
    approverRoles: ["manager"],
  },
  {
    id: "p-3",
    name: "Admin Dashboard",
    description:
      "Internal console for organization admins — member approvals, project setup and workflow configuration.",
    status: "active",
    progress: 88,
    color: "#8B5CF6",
    dueDate: "2026-08-25T00:00:00.000Z",
    createdAt: "2026-02-11T09:00:00.000Z",
    memberIds: ["u-1", "u-2", "u-4", "u-6"],
    taskCounts: {
      total: 3,
      toDo: 0,
      inProgress: 1,
      pendingApproval: 0,
      completed: 2,
    },
    approverRoles: ["team-lead", "manager"],
  },
  {
    id: "p-4",
    name: "Payments Integration",
    description:
      "Subscription billing, invoices and the payment provider migration for enterprise plans.",
    status: "on-hold",
    progress: 30,
    color: "#F97316",
    dueDate: "2026-11-20T00:00:00.000Z",
    createdAt: "2026-06-08T09:00:00.000Z",
    memberIds: ["u-2", "u-3", "u-4"],
    taskCounts: {
      total: 2,
      toDo: 1,
      inProgress: 0,
      pendingApproval: 0,
      completed: 1,
    },
    approverRoles: ["manager"],
  },
  {
    id: "p-5",
    name: "Onboarding Revamp",
    description:
      "New employee onboarding flow with guided setup, sample projects and in-app tips.",
    status: "completed",
    progress: 100,
    color: "#14B8A6",
    dueDate: "2026-06-30T00:00:00.000Z",
    createdAt: "2026-01-15T09:00:00.000Z",
    memberIds: ["u-1", "u-5", "u-7"],
    taskCounts: {
      total: 2,
      toDo: 0,
      inProgress: 0,
      pendingApproval: 0,
      completed: 2,
    },
    approverRoles: ["team-lead", "manager"],
  },
];

export const getProjectById = (id?: string | null) =>
  projects.find((project) => project.id === id);
