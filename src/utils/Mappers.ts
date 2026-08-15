import {
  DashboardModel,
  DashboardSummaryModel,
  DashboardTaskModel,
  WorkloadEntryModel,
} from "../models/dashboard";
import {
  NotificationCategory,
  NotificationEntityType,
  NotificationModel,
} from "../models/notification";
import { OrganizationSummaryModel } from "../models/organization";
import {
  ProjectDetailsModel,
  ProjectMemberModel,
  ProjectModel,
  ProjectPersonModel,
  ProjectRole,
  ProjectStatus,
  ProjectWorkflowModel,
} from "../models/project";
import {
  ActivityModel,
  ActivityType,
  AttachmentModel,
  CommentModel,
  MentionableUserModel,
  TaskModel,
  TaskPermissionsModel,
  TaskPersonModel,
  TaskPriority,
  TaskStatus,
} from "../models/task";
import { UserDataModel, UserModel, UserRole, UserStatus } from "../models/user";

/** The API sends snake_case roles (`team_member`); the app models use kebab-case. */
const ROLE_MAP: Record<string, UserRole> = {
  team_member: "team-member",
  "team-member": "team-member",
  team_lead: "team-lead",
  "team-lead": "team-lead",
  manager: "manager",
};

/**
 * `rejected` and `removed` accounts are locked out the same way `suspended`
 * ones are, so they share the AccountSuspended screen.
 */
const STATUS_MAP: Record<string, UserStatus> = {
  active: "active",
  pending: "pending",
  suspended: "suspended",
  rejected: "suspended",
  removed: "suspended",
};

export const mapApiRole = (role: any): UserRole =>
  ROLE_MAP[role] ?? "team-member";

export const mapApiStatus = (status: any): UserStatus =>
  STATUS_MAP[status] ?? "pending";

/** Normalises an employee user object from the API into the app's UserModel. */
export const mapApiUser = (apiUser: any): UserModel => ({
  id: apiUser?._id ?? apiUser?.id ?? "",
  name: apiUser?.name ?? "",
  email: apiUser?.email ?? "",
  image: apiUser?.image ?? apiUser?.profileImage ?? apiUser?.avatar ?? "",
  role: mapApiRole(apiUser?.role),
  status: mapApiStatus(apiUser?.status),
  jobTitle: apiUser?.jobTitle ?? apiUser?.designation ?? "",
  department: apiUser?.department ?? undefined,
  phoneNumber: apiUser?.phoneNumber ?? undefined,
  organizationId:
    apiUser?.organization?._id ??
    apiUser?.organization?.id ??
    apiUser?.organization ??
    apiUser?.organizationId ??
    "",
  joinedAt: apiUser?.joinedAt ?? apiUser?.createdAt ?? new Date().toISOString(),
});

/**
 * Flattens the `data` block of a register / login / refresh response into the
 * shape the user slice stores.
 */
export const mapAuthResponse = (data: any): UserDataModel => ({
  ...mapApiUser(data?.user),
  accessToken: data?.accessToken ?? "",
  refreshToken: data?.refreshToken ?? "",
});

/**
 * The organization block sent by `register`, `initialize` and
 * `GET /organization`. The first two carry only the identity fields, so the
 * detail fields stay undefined until the dedicated call runs.
 */
export const mapApiOrganization = (
  apiOrganization: any,
): OrganizationSummaryModel => ({
  id: apiOrganization?._id ?? apiOrganization?.id ?? "",
  name: apiOrganization?.name ?? "",
  uniqueOrganizationId: apiOrganization?.uniqueOrganizationId ?? "",
  logo: apiOrganization?.logo ?? undefined,
  timezone: apiOrganization?.timezone ?? undefined,
  industry: apiOrganization?.industry ?? undefined,
  website: apiOrganization?.website ?? undefined,
  employeeCount: apiOrganization?.employeeCount ?? undefined,
  workingDays: apiOrganization?.workingDays ?? undefined,
  workingHours: apiOrganization?.workingHours ?? undefined,
  workflowSettings: apiOrganization?.workflowSettings ?? undefined,
});

/** The API sends snake_case statuses; `returned` shares the rejected styling. */
const TASK_STATUS_MAP: Record<string, TaskStatus> = {
  pending: "to-do",
  todo: "to-do",
  "to-do": "to-do",
  in_progress: "in-progress",
  "in-progress": "in-progress",
  pending_approval: "pending-approval",
  "pending-approval": "pending-approval",
  completed: "completed",
  done: "completed",
  rejected: "rejected",
  returned: "rejected",
  blocked: "blocked",
};

const TASK_PRIORITY_MAP: Record<string, TaskPriority> = {
  low: "low",
  medium: "medium",
  high: "high",
  urgent: "urgent",
};

const PROJECT_STATUS_MAP: Record<string, ProjectStatus> = {
  active: "active",
  on_hold: "on-hold",
  "on-hold": "on-hold",
  completed: "completed",
};

export const mapApiTaskStatus = (status: any): TaskStatus =>
  TASK_STATUS_MAP[status] ?? "to-do";

export const mapApiTaskPriority = (priority: any): TaskPriority =>
  TASK_PRIORITY_MAP[priority] ?? "medium";

/**
 * The trimmed task the dashboard endpoints return. `projectId` arrives
 * populated as an object, but falls back to a bare id on lean responses.
 */
export const mapDashboardTask = (apiTask: any): DashboardTaskModel => {
  const apiProject = apiTask?.projectId ?? apiTask?.project;
  const projectId =
    typeof apiProject === "string"
      ? apiProject
      : apiProject?._id ?? apiProject?.id ?? "";

  return {
    id: apiTask?._id ?? apiTask?.id ?? "",
    title: apiTask?.title ?? "",
    status: mapApiTaskStatus(apiTask?.status),
    priority: mapApiTaskPriority(apiTask?.priority),
    dueDate: apiTask?.dueDate ?? "",
    project: projectId
      ? {
          id: projectId,
          name: typeof apiProject === "string" ? "" : apiProject?.name ?? "",
          code: typeof apiProject === "string" ? "" : apiProject?.code ?? "",
        }
      : null,
  };
};

const toCount = (value: any): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

export const mapDashboardSummary = (
  apiSummary: any,
): DashboardSummaryModel => ({
  assignedTasks: toCount(apiSummary?.assignedTasks),
  pendingTasks: toCount(apiSummary?.pendingTasks),
  inProgressTasks: toCount(apiSummary?.inProgressTasks),
  blockedTasks: toCount(apiSummary?.blockedTasks),
  returnedTasks: toCount(apiSummary?.returnedTasks),
  completedTasks: toCount(apiSummary?.completedTasks),
  rejectedTasks: toCount(apiSummary?.rejectedTasks),
  overdueTasks: toCount(apiSummary?.overdueTasks),
  pendingApprovals: toCount(apiSummary?.pendingApprovals),
  awaitingMyApproval: toCount(apiSummary?.awaitingMyApproval),
  openTasks: toCount(apiSummary?.openTasks),
  projects: toCount(apiSummary?.projects),
  unreadNotifications: toCount(apiSummary?.unreadNotifications),
  completionRate: toCount(apiSummary?.completionRate),
});

/** Flattens the `data` block of `GET /dashboard`. */
export const mapDashboard = (data: any): DashboardModel => ({
  summary: mapDashboardSummary(data?.summary),
  todaysTasks: (data?.todaysTasks ?? []).map(mapDashboardTask),
  recentActivity: (data?.recentActivity ?? []).map(mapApiActivity),
});

export const mapWorkloadEntry = (apiEntry: any): WorkloadEntryModel => ({
  projectId: apiEntry?.projectId ?? "",
  projectName: apiEntry?.projectName ?? "Untitled project",
  projectStatus: PROJECT_STATUS_MAP[apiEntry?.projectStatus] ?? "active",
  total: toCount(apiEntry?.total),
  open: toCount(apiEntry?.open),
  completed: toCount(apiEntry?.completed),
});

/** Mongo refs arrive either populated or as a bare id string. */
const toId = (value: any): string =>
  typeof value === "string" ? value : value?._id ?? value?.id ?? "";

/** The status names the API accepts back, keyed by the app's own status. */
const API_TASK_STATUS: Record<TaskStatus, string> = {
  "to-do": "pending",
  "in-progress": "in_progress",
  "pending-approval": "pending_approval",
  completed: "completed",
  rejected: "rejected",
  blocked: "blocked",
};

export const toApiTaskStatus = (status: TaskStatus): string =>
  API_TASK_STATUS[status];

const PROJECT_ROLE_MAP: Record<string, ProjectRole> = {
  manager: "manager",
  team_lead: "team-lead",
  "team-lead": "team-lead",
  lead: "team-lead",
  member: "member",
};

export const mapApiProjectRole = (role: any): ProjectRole =>
  PROJECT_ROLE_MAP[role] ?? "member";

/** Timeline and activity rows share one wire shape across every endpoint. */
const ACTIVITY_TYPE_MAP: Record<string, ActivityType> = {
  created: "created",
  assigned: "assigned",
  status_changed: "status-changed",
  "status-changed": "status-changed",
  submitted: "submitted",
  approved: "approved",
  rejected: "rejected",
  returned: "returned",
  commented: "commented",
  due_date_changed: "due-date-changed",
  "due-date-changed": "due-date-changed",
};

export const mapApiActivityType = (action: any): ActivityType =>
  ACTIVITY_TYPE_MAP[action] ?? "status-changed";

/**
 * Activity rows carry no id of their own, so one is derived from the task and
 * timestamp to keep list keys stable across re-renders.
 */
export const mapApiActivity = (
  apiActivity: any,
  index: number,
): ActivityModel => ({
  id:
    apiActivity?._id ??
    apiActivity?.id ??
    `${toId(apiActivity?.taskId) || "activity"}-${
      apiActivity?.createdAt ?? index
    }`,
  taskId: toId(apiActivity?.taskId),
  taskTitle: apiActivity?.taskTitle ?? undefined,
  actorName: apiActivity?.actorName ?? "",
  type: mapApiActivityType(apiActivity?.action ?? apiActivity?.type),
  message: apiActivity?.message ?? "",
  createdAt: apiActivity?.createdAt ?? "",
});

const mapApiPerson = (apiPerson: any): TaskPersonModel | null => {
  const id = toId(apiPerson);
  if (!id) {
    return null;
  }

  return {
    id,
    name: typeof apiPerson === "string" ? "" : apiPerson?.name ?? "",
    image:
      typeof apiPerson === "string"
        ? ""
        : apiPerson?.avatar ?? apiPerson?.image ?? "",
  };
};

/**
 * Mongo refs arrive either populated or as a bare id string. An unpopulated
 * ref has no name and no role — `role` stays null rather than defaulting to
 * `team-member`, which would otherwise invent a role the API never sent.
 */
const mapProjectPerson = (apiPerson: any): ProjectPersonModel => {
  if (typeof apiPerson === "string" || !apiPerson) {
    return { id: toId(apiPerson), name: "", role: null };
  }

  return {
    id: toId(apiPerson),
    name: apiPerson.name ?? "",
    role: apiPerson.role ? mapApiRole(apiPerson.role) : null,
  };
};

/** The project block returned by both the list and the detail endpoint. */
export const mapApiProject = (apiProject: any): ProjectModel => {
  const stats = apiProject?.taskStats ?? {};

  return {
    id: toId(apiProject),
    name: apiProject?.name ?? "",
    code: apiProject?.code ?? "",
    status: PROJECT_STATUS_MAP[apiProject?.status] ?? "active",
    priority: mapApiTaskPriority(apiProject?.priority),
    startDate: apiProject?.startDate ?? "",
    endDate: apiProject?.endDate ?? "",
    projectRole: mapApiProjectRole(apiProject?.projectRole),
    memberCount: toCount(apiProject?.memberCount),
    taskStats: {
      total: toCount(stats.totalTasks ?? stats.total),
      completed: toCount(stats.completedTasks ?? stats.completed),
      mine: toCount(stats.myTasks ?? stats.mine),
      completionPercentage: toCount(stats.completionPercentage),
    },
  };
};

export const mapApiWorkflow = (apiWorkflow: any): ProjectWorkflowModel => ({
  requireTaskApproval: Boolean(apiWorkflow?.requireTaskApproval),
  approverRole: apiWorkflow?.approverRole
    ? mapApiRole(apiWorkflow.approverRole)
    : null,
  approvers: (apiWorkflow?.approvers ?? []).map(mapProjectPerson),
  defaultPriority: mapApiTaskPriority(apiWorkflow?.defaultPriority),
  allowMemberTaskCreation: apiWorkflow?.allowMemberTaskCreation !== false,
  allowMemberTaskDeletion: Boolean(apiWorkflow?.allowMemberTaskDeletion),
});

/** Flattens the `data` block of `GET /projects/:id`. */
export const mapApiProjectDetails = (data: any): ProjectDetailsModel => {
  const project = mapApiProject(data?.project);
  const stats = data?.taskStats ?? {};

  return {
    project: {
      ...project,
      managers: (data?.project?.managers ?? []).map(mapProjectPerson),
      teamLeads: (data?.project?.teamLeads ?? []).map(mapProjectPerson),
    },
    workflow: mapApiWorkflow(data?.workflow),
    taskStats: {
      total: toCount(stats.total),
      completed: toCount(stats.byStatus?.completed),
      mine: project.taskStats.mine,
      completionPercentage: toCount(stats.completionPercentage),
      byStatus: stats.byStatus ?? {},
    },
  };
};

export const mapApiProjectMember = (apiMember: any): ProjectMemberModel => ({
  id: toId(apiMember),
  name: apiMember?.name ?? "",
  email: apiMember?.email ?? "",
  role: mapApiRole(apiMember?.role),
  avatar: apiMember?.avatar ?? apiMember?.image ?? "",
  designation: apiMember?.designation ?? apiMember?.jobTitle ?? "",
  projectRole: mapApiProjectRole(apiMember?.projectRole),
  // Absent on a response that predates the flag — stay permissive there and let
  // the API reject the assignment, rather than hiding everyone.
  assignable: apiMember?.assignable !== false,
});

/** Normalises a task from any of the employee task endpoints. */
export const mapApiTask = (apiTask: any): TaskModel => {
  const apiProject = apiTask?.projectId ?? apiTask?.project;
  const projectId = toId(apiProject);

  return {
    id: toId(apiTask),
    title: apiTask?.title ?? "",
    description: apiTask?.description ?? "",
    status: mapApiTaskStatus(apiTask?.status),
    priority: mapApiTaskPriority(apiTask?.priority),
    dueDate: apiTask?.dueDate ?? "",
    createdAt: apiTask?.createdAt ?? "",
    updatedAt: apiTask?.updatedAt ?? apiTask?.createdAt ?? "",
    projectId,
    project: projectId
      ? {
          id: projectId,
          name: typeof apiProject === "string" ? "" : apiProject?.name ?? "",
          code: typeof apiProject === "string" ? "" : apiProject?.code ?? "",
        }
      : null,
    creator: mapApiPerson(apiTask?.createdBy ?? apiTask?.creator),
    assignee: mapApiPerson(apiTask?.assignee),
    approvers: (apiTask?.approvers ?? [])
      .map(mapApiPerson)
      .filter((person: TaskPersonModel | null): person is TaskPersonModel =>
        Boolean(person),
      ),
    requiresApproval: Boolean(apiTask?.requiresApproval),
    estimatedHours: apiTask?.estimatedHours ?? undefined,
    actualHours: apiTask?.actualHours ?? undefined,
    tags: apiTask?.tags ?? [],
    startedAt: apiTask?.startedAt ?? undefined,
    submittedAt: apiTask?.submittedAt ?? undefined,
    completedAt: apiTask?.completedAt ?? undefined,
    assignmentAcceptedAt: apiTask?.assignmentAcceptedAt ?? undefined,
    attachments: (apiTask?.attachments ?? []).map(mapApiAttachment),
    commentCount: toCount(apiTask?.commentCount ?? apiTask?.comments?.length),
    rejectionReason:
      apiTask?.rejectionReason ?? apiTask?.reviewComments ?? undefined,
  };
};

/**
 * Flattens the `data` block of `GET /tasks/:id`. The timeline rides along
 * inside the task, so it is lifted out here rather than refetched. Comments
 * have their own paginated endpoint and are not read from here.
 */
export const mapApiTaskDetails = (data: any) => ({
  task: mapApiTask(data?.task),
  permissions: mapApiTaskPermissions(data?.permissions),
  timeline: (data?.task?.timeline ?? []).map(mapApiActivity) as ActivityModel[],
});

export const mapApiTaskPermissions = (
  apiPermissions: any,
): TaskPermissionsModel => ({
  canEdit: Boolean(apiPermissions?.canEdit),
  canDelete: Boolean(apiPermissions?.canDelete),
  canUpdateStatus: Boolean(apiPermissions?.canUpdateStatus),
});

export const mapApiMentionableUser = (apiUser: any): MentionableUserModel => ({
  id: toId(apiUser),
  name: apiUser?.name ?? "",
  email: apiUser?.email ?? "",
  avatar: apiUser?.avatar ?? apiUser?.image ?? "",
});

/**
 * The comment endpoints send the author as flat `authorId` / `authorName`
 * fields rather than a populated object, and nest replies one level deep.
 */
export const mapApiComment = (apiComment: any): CommentModel => {
  const authorId = toId(apiComment?.authorId ?? apiComment?.author);

  return {
    id: toId(apiComment),
    taskId: toId(apiComment?.taskId ?? apiComment?.task),
    parentId: apiComment?.parentId ? toId(apiComment.parentId) : null,
    content: apiComment?.content ?? apiComment?.body ?? "",
    author: authorId
      ? {
          id: authorId,
          name: apiComment?.authorName ?? apiComment?.author?.name ?? "",
          image: apiComment?.authorAvatar ?? apiComment?.author?.avatar ?? "",
        }
      : null,
    mentions: (apiComment?.mentions ?? [])
      // A lean response sends bare ids; only populated objects can be shown.
      .filter((mention: any) => typeof mention !== "string")
      .map(mapApiMentionableUser),
    replyCount: toCount(apiComment?.replyCount),
    edited: Boolean(apiComment?.isEdited ?? apiComment?.edited),
    createdAt: apiComment?.createdAt ?? "",
    replies: (apiComment?.replies ?? []).map(mapApiComment),
  };
};

export const mapApiAttachment = (apiAttachment: any): AttachmentModel => ({
  id: toId(apiAttachment),
  name:
    apiAttachment?.name ??
    apiAttachment?.originalName ??
    apiAttachment?.fileName ??
    "Attachment",
  url: apiAttachment?.url ?? apiAttachment?.path ?? "",
  size: toCount(apiAttachment?.size),
  mimeType: apiAttachment?.mimeType ?? apiAttachment?.type ?? "",
  uploadedById: toId(apiAttachment?.uploadedBy ?? apiAttachment?.uploadedById),
  uploadedByName:
    apiAttachment?.uploadedByName ?? apiAttachment?.uploadedBy?.name ?? "",
  createdAt: apiAttachment?.createdAt ?? apiAttachment?.uploadedAt ?? "",
});

/** The API's own notification types, grouped for the tabs and row icons. */
const NOTIFICATION_CATEGORY: Record<string, NotificationCategory> = {
  task_assigned: "task",
  task_updated: "task",
  task_unassigned: "task",
  task_due_soon: "task",
  task_overdue: "task",
  task_commented: "task",
  comment_mention: "task",
  task_submitted: "approval",
  task_approved: "approval",
  task_rejected: "approval",
  task_returned: "approval",
  approval_requested: "approval",
  project_assigned: "project",
  project_updated: "project",
  project_removed: "project",
  employee_approved: "organization",
  employee_rejected: "organization",
  employee_suspended: "organization",
  organization_updated: "organization",
};

/** Falls back to the type's prefix so unknown types still land in a tab. */
export const mapApiNotificationCategory = (type: any): NotificationCategory => {
  const known = NOTIFICATION_CATEGORY[type];
  if (known) {
    return known;
  }

  const name = String(type ?? "");
  if (name.startsWith("project")) {
    return "project";
  }
  if (name.startsWith("employee") || name.startsWith("organization")) {
    return "organization";
  }
  return "task";
};

const NOTIFICATION_ENTITY: Record<string, NotificationEntityType> = {
  task: "task",
  project: "project",
  employee: "employee",
};

export const mapApiNotification = (apiNotification: any): NotificationModel => {
  const entityType =
    NOTIFICATION_ENTITY[apiNotification?.entityType] ?? "other";
  const entityId = apiNotification?.entityId
    ? toId(apiNotification.entityId)
    : undefined;

  return {
    id: toId(apiNotification),
    type: apiNotification?.type ?? "",
    category: mapApiNotificationCategory(apiNotification?.type),
    title: apiNotification?.title ?? "",
    body: apiNotification?.message ?? apiNotification?.body ?? "",
    createdAt: apiNotification?.createdAt ?? "",
    read: Boolean(apiNotification?.isRead ?? apiNotification?.read),
    entityType,
    entityId,
    taskId: entityType === "task" ? entityId : undefined,
    projectId: entityType === "project" ? entityId : undefined,
  };
};
