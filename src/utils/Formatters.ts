import Colors from "../configs/Colors";
import Constant from "../configs/Constant";
import { ProjectStatus } from "../models/project";
import { TaskPriority, TaskStatus } from "../models/task";
import { UserRole, UserStatus } from "../models/user";

export type BadgeMeta = {
  label: string;
  color: string;
  background: string;
};

const TASK_STATUS_META: Record<TaskStatus, BadgeMeta> = {
  "to-do": {
    label: "To Do",
    color: Colors.statusToDo,
    background: Colors.statusToDoSoft,
  },
  "in-progress": {
    label: "In Progress",
    color: Colors.statusInProgress,
    background: Colors.statusInProgressSoft,
  },
  "pending-approval": {
    label: "Pending Approval",
    color: Colors.statusPendingApproval,
    background: Colors.statusPendingApprovalSoft,
  },
  completed: {
    label: "Completed",
    color: Colors.statusCompleted,
    background: Colors.statusCompletedSoft,
  },
  rejected: {
    label: "Rejected",
    color: Colors.statusRejected,
    background: Colors.statusRejectedSoft,
  },
  blocked: {
    label: "Blocked",
    color: Colors.statusBlocked,
    background: Colors.statusBlockedSoft,
  },
};

const TASK_PRIORITY_META: Record<TaskPriority, BadgeMeta> = {
  low: {
    label: "Low",
    color: Colors.priorityLow,
    background: Colors.priorityLowSoft,
  },
  medium: {
    label: "Medium",
    color: Colors.priorityMedium,
    background: Colors.priorityMediumSoft,
  },
  high: {
    label: "High",
    color: Colors.priorityHigh,
    background: Colors.priorityHighSoft,
  },
  urgent: {
    label: "Urgent",
    color: Colors.priorityUrgent,
    background: Colors.priorityUrgentSoft,
  },
};

const PROJECT_STATUS_META: Record<ProjectStatus, BadgeMeta> = {
  active: {
    label: "Active",
    color: Colors.statusInProgress,
    background: Colors.statusInProgressSoft,
  },
  "on-hold": {
    label: "On Hold",
    color: Colors.statusPendingApproval,
    background: Colors.statusPendingApprovalSoft,
  },
  completed: {
    label: "Completed",
    color: Colors.statusCompleted,
    background: Colors.statusCompletedSoft,
  },
};

const USER_ROLE_META: Record<UserRole, BadgeMeta> = {
  "team-member": {
    label: "Team Member",
    color: Colors.lightFont,
    background: Colors.leaderboardBorderVeryLight,
  },
  "team-lead": {
    label: "Team Lead",
    color: Colors.primary,
    background: Colors.secondary,
  },
  manager: {
    label: "Manager",
    color: Colors.statusBlocked,
    background: Colors.statusBlockedSoft,
  },
};

const USER_STATUS_META: Record<UserStatus, BadgeMeta> = {
  active: {
    label: "Active",
    color: Colors.success,
    background: Colors.successSoft,
  },
  pending: {
    label: "Pending Approval",
    color: Colors.warning,
    background: Colors.warningSoft,
  },
  suspended: {
    label: "Suspended",
    color: Colors.danger,
    background: Colors.dangerSoft,
  },
};

export const getTaskStatusMeta = (status: TaskStatus) =>
  TASK_STATUS_META[status];

export const getTaskPriorityMeta = (priority: TaskPriority) =>
  TASK_PRIORITY_META[priority];

export const getProjectStatusMeta = (status: ProjectStatus) =>
  PROJECT_STATUS_META[status];

export const getUserRoleMeta = (role: UserRole) => USER_ROLE_META[role];

export const getUserStatusMeta = (status: UserStatus) =>
  USER_STATUS_META[status];

const TASK_STATUS_ICONS: Record<TaskStatus, string> = {
  "to-do": "ellipse-outline",
  "in-progress": "play-circle-outline",
  "pending-approval": "hourglass-outline",
  completed: "checkmark-circle-outline",
  rejected: "close-circle-outline",
  blocked: "alert-circle-outline",
};

export const getTaskStatusIcon = (status: TaskStatus) =>
  TASK_STATUS_ICONS[status];

export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
};

/** Deterministic avatar tint so the same person keeps the same color. */
export const getAvatarColor = (seed: string): string => {
  let hash = 0;
  for (let index = 0; index < seed.length; index++) {
    hash = seed.charCodeAt(index) + ((hash << 5) - hash);
  }
  const palette = Colors.avatarPalette;
  return palette[Math.abs(hash) % palette.length];
};

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

export const daysUntil = (isoDate: string): number => {
  const dayInMs = 24 * 60 * 60 * 1000;
  return Math.round(
    (startOfDay(new Date(isoDate)) - startOfDay(new Date())) / dayInMs
  );
};

export const formatDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const formatShortDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

export const formatTime = (isoDate: string): string =>
  new Date(isoDate).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

export const formatDateTime = (isoDate: string): string =>
  `${formatDate(isoDate)} · ${formatTime(isoDate)}`;

/** "Due Today", "Overdue by 2 days", "Due Aug 15" — used all over the task UI. */
export const formatDueDate = (isoDate: string): string => {
  const days = daysUntil(isoDate);

  if (days === 0) return "Due Today";
  if (days === 1) return "Due Tomorrow";
  if (days === -1) return "Overdue by 1 day";
  if (days < -1) return `Overdue by ${Math.abs(days)} days`;
  if (days <= 7) return `Due in ${days} days`;
  return `Due ${formatShortDate(isoDate)}`;
};

export const isOverdue = (isoDate: string, status?: TaskStatus): boolean =>
  status !== "completed" && daysUntil(isoDate) < 0;

export const formatRelativeTime = (isoDate: string): string => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.round(diffMs / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.round(days / 7)}w ago`;

  return formatShortDate(isoDate);
};

/** Rich text descriptions render as plain text inside list cards. */
export const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

export type PasswordRuleStatus = {
  id: string;
  name: string;
  isMatched: boolean;
};

/** Checks Constant.PASSWORD_RULES against a password, keyed by rule id. */
export const getPasswordRules = (password: string): PasswordRuleStatus[] => {
  const checks: Record<string, boolean> = {
    "1": password.length >= 8,
    "2": /[A-Z]/.test(password),
    "3": /[a-z]/.test(password),
    "4": /[0-9]/.test(password),
    "5": /[^A-Za-z0-9]/.test(password),
  };

  return Constant.PASSWORD_RULES.map((rule) => ({
    ...rule,
    isMatched: checks[rule.id] ?? false,
  }));
};

export const isPasswordValid = (password: string): boolean =>
  getPasswordRules(password).every((rule) => rule.isMatched);

export const greetingForNow = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};
