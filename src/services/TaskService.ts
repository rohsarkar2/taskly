import { axiosPrivate } from "../axios/Axios";
import Constant from "../configs/Constant";
import { getAxoisRequestHeaders } from "../utils/Utils";

/** Network failures have no `response`, so read the API message defensively. */
const getErrorMessage = (error: any) =>
  error?.response?.data?.message ??
  error?.message ??
  "Something went wrong. Please try again.";

/** `team` is project work not assigned to you; omit `scope` for everything. */
export type TaskScope = "assigned" | "created" | "team";

export type TaskAttachmentUpload = {
  uri: string;
  name?: string;
  type?: string;
};

export type TaskListParams = {
  scope?: TaskScope;
  search?: string;
  status?: string;
  priority?: string;
  projectId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

/** Drops empty values so the query string only carries filters that are set. */
const toQueryString = (params: Record<string, any>) => {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join("&");

  return query ? `?${query}` : "";
};

/** Scoped to tasks on projects you belong to. Requires an approved account. */
export default class TaskService {
  static taskList = async (params: TaskListParams = {}) => {
    try {
      const options = await getAxoisRequestHeaders();
      const response = await axiosPrivate.get(
        `employee/tasks${toQueryString(params)}`,
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /** Shorthands for `scope=assigned` / `created` / `team`. */
  static assignedTasks = async (params: Omit<TaskListParams, "scope"> = {}) => {
    try {
      const options = await getAxoisRequestHeaders();
      const response = await axiosPrivate.get(
        `employee/tasks/assigned${toQueryString(params)}`,
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  static createdTasks = async (params: Omit<TaskListParams, "scope"> = {}) => {
    try {
      const options = await getAxoisRequestHeaders();
      const response = await axiosPrivate.get(
        `employee/tasks/created${toQueryString(params)}`,
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  static teamTasks = async (params: Omit<TaskListParams, "scope"> = {}) => {
    try {
      const options = await getAxoisRequestHeaders();
      const response = await axiosPrivate.get(
        `employee/tasks/team${toQueryString(params)}`,
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /** Requires `title` and `projectId`; `assignee` defaults to yourself. */
  static createTask = async (reqBody = {}) => {
    try {
      const options = await getAxoisRequestHeaders(Constant.POST_REQUEST);
      const response = await axiosPrivate.post(`employee/tasks`, reqBody, {
        headers: options,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /** Comes back with a `permissions` block alongside the task. */
  static getTaskDetails = async (taskId: string) => {
    try {
      const options = await getAxoisRequestHeaders();
      const response = await axiosPrivate.get(`employee/tasks/${taskId}`, {
        headers: options,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /** Status is not editable here — use `updateTaskStatus`. */
  static updateTask = async (taskId: string, reqBody = {}) => {
    try {
      const options = await getAxoisRequestHeaders(Constant.PUT_REQUEST);
      const response = await axiosPrivate.put(
        `employee/tasks/${taskId}`,
        reqBody,
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /** Soft delete — only your own tasks, and only if the workflow allows it. */
  static deleteTask = async (taskId: string) => {
    try {
      const options = await getAxoisRequestHeaders(Constant.DELETE_REQUEST);
      const response = await axiosPrivate.delete(`employee/tasks/${taskId}`, {
        headers: options,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /**
   * Assignee-only. `pending_approval` and (on approval-gated tasks)
   * `completed` / `rejected` are refused here — go through `completeTask`.
   */
  static updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const options = await getAxoisRequestHeaders(Constant.PUT_REQUEST);
      const response = await axiosPrivate.put(
        `employee/tasks/${taskId}/status`,
        { status },
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  static acceptTask = async (taskId: string) => {
    try {
      const options = await getAxoisRequestHeaders(Constant.POST_REQUEST);
      const response = await axiosPrivate.post(
        `employee/tasks/${taskId}/accept`,
        {},
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  static startTask = async (taskId: string) => {
    try {
      const options = await getAxoisRequestHeaders(Constant.POST_REQUEST);
      const response = await axiosPrivate.post(
        `employee/tasks/${taskId}/start`,
        {},
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /**
   * Completes outright or submits for review, depending on the project's
   * effective workflow. The response message says which happened.
   */
  static completeTask = async (taskId: string, note?: string) => {
    try {
      const options = await getAxoisRequestHeaders(Constant.POST_REQUEST);
      const response = await axiosPrivate.post(
        `employee/tasks/${taskId}/complete`,
        note ? { note } : {},
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /** Tasks awaiting *your* approval. */
  static pendingApprovals = async (page = 1, limit = 20) => {
    try {
      const options = await getAxoisRequestHeaders();
      const response = await axiosPrivate.get(
        `employee/tasks/approvals/pending?page=${page}&limit=${limit}`,
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  static approveTask = async (taskId: string, comments?: string) => {
    try {
      const options = await getAxoisRequestHeaders(Constant.POST_REQUEST);
      const response = await axiosPrivate.post(
        `employee/tasks/${taskId}/approve`,
        comments ? { comments } : {},
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /** `comments` is required for both reject and return. */
  static rejectTask = async (taskId: string, comments: string) => {
    try {
      const options = await getAxoisRequestHeaders(Constant.POST_REQUEST);
      const response = await axiosPrivate.post(
        `employee/tasks/${taskId}/reject`,
        { comments },
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /** Up to 5 files at 10 MB each; the API records a timeline entry. */
  static uploadAttachments = async (
    taskId: string,
    files: TaskAttachmentUpload[],
  ) => {
    try {
      const options = await getAxoisRequestHeaders(Constant.POST_REQUEST, true);
      const formData = new FormData();

      files.forEach((file, index) => {
        formData.append("files", {
          uri: file.uri,
          name: file.name ?? `attachment-${index + 1}`,
          type: file.type ?? "application/octet-stream",
        } as any);
      });

      const response = await axiosPrivate.post(
        `employee/tasks/${taskId}/attachments`,
        formData,
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /** Your own uploads; task owners and project leads may delete any. */
  static deleteAttachment = async (taskId: string, attachmentId: string) => {
    try {
      const options = await getAxoisRequestHeaders(Constant.DELETE_REQUEST);
      const response = await axiosPrivate.delete(
        `employee/tasks/${taskId}/attachments/${attachmentId}`,
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  static returnTask = async (taskId: string, comments: string) => {
    try {
      const options = await getAxoisRequestHeaders(Constant.POST_REQUEST);
      const response = await axiosPrivate.post(
        `employee/tasks/${taskId}/return`,
        { comments },
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };
}
