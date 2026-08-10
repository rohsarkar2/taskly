import { ProjectModel } from "../models/project";
import { TaskModel, TaskStatus } from "../models/task";
import { UserModel, UserRole } from "../models/user";
import { activity, getActivityByTaskId, recentActivity } from "./activity";
import { comments, getCommentsByTaskId } from "./comments";
import { notifications, unreadNotificationCount } from "./notifications";
import { organization } from "./organization";
import { getProjectById, projects } from "./projects";
import { getTaskById, tasks } from "./tasks";
import { currentUser, getUserById, getUsersByIds, users } from "./users";

export {
  activity,
  comments,
  currentUser,
  getActivityByTaskId,
  getCommentsByTaskId,
  getProjectById,
  getTaskById,
  getUserById,
  getUsersByIds,
  notifications,
  organization,
  projects,
  recentActivity,
  tasks,
  unreadNotificationCount,
  users,
};

export const getProjectName = (projectId: string) =>
  getProjectById(projectId)?.name ?? "Unknown project";

export const getTasksByProjectId = (projectId: string): TaskModel[] =>
  tasks.filter((task) => task.projectId === projectId);

export const getTasksAssignedTo = (userId: string): TaskModel[] =>
  tasks.filter((task) => task.assigneeId === userId);

export const getTasksCreatedBy = (userId: string): TaskModel[] =>
  tasks.filter((task) => task.creatorId === userId);

export const getProjectsForUser = (userId: string): ProjectModel[] =>
  projects.filter((project) => project.memberIds.includes(userId));

export const getProjectMembers = (projectId: string): UserModel[] =>
  getUsersByIds(getProjectById(projectId)?.memberIds ?? []);

/**
 * Tasks this user is allowed to act on as an approver. The real rule lives on
 * the backend — this mirrors it so the static UI shows a believable queue.
 */
export const getPendingApprovalsFor = (user: {
  id: string;
  role: UserRole;
}): TaskModel[] => {
  if (user.role === "team-member") {
    return [];
  }

  return tasks.filter((task) => {
    if (task.status !== "pending-approval") {
      return false;
    }
    if (task.creatorId === user.id) {
      return false; // nobody approves their own work
    }
    if (task.approverId) {
      return task.approverId === user.id;
    }

    const project = getProjectById(task.projectId);
    return Boolean(
      project?.approverRoles.includes(user.role as "team-lead" | "manager"),
    );
  });
};

/** Everyone a lead or manager oversees. Static stand-in for a team endpoint. */
export const getTeamMembersFor = (user: {
  id: string;
  role: UserRole;
}): UserModel[] => {
  if (user.role === "manager") {
    return users.filter((member) => member.id !== user.id);
  }
  if (user.role === "team-lead") {
    return users.filter(
      (member) => member.role === "team-member" && member.id !== user.id,
    );
  }
  return [];
};

export const countByStatus = (
  taskList: TaskModel[],
  status: TaskStatus,
): number => taskList.filter((task) => task.status === status).length;
