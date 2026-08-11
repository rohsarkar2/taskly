import { axiosPrivate } from "../axios/Axios";
import Constant from "../configs/Constant";
import { getAxoisRequestHeaders } from "../utils/Utils";

/** Network failures have no `response`, so read the API message defensively. */
const getErrorMessage = (error: any) =>
  error?.response?.data?.message ??
  error?.message ??
  "Something went wrong. Please try again.";

export default class CommentService {
  /**
   * Top-level comments newest first, each with its replies nested oldest
   * first. Replies are one level deep only.
   */
  static commentList = async (taskId: string, page = 1, limit = 50) => {
    try {
      const options = await getAxoisRequestHeaders();
      const response = await axiosPrivate.get(
        `employee/tasks/${taskId}/comments?page=${page}&limit=${limit}`,
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /**
   * `@name` / `@email` in the content is matched against the project's members
   * server side. Omit `parentId` for a top-level comment.
   */
  static addComment = async (
    taskId: string,
    content: string,
    parentId?: string | null,
  ) => {
    try {
      const options = await getAxoisRequestHeaders(Constant.POST_REQUEST);
      const response = await axiosPrivate.post(
        `employee/tasks/${taskId}/comments`,
        parentId ? { content, parentId } : { content },
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  static getReplies = async (commentId: string) => {
    try {
      const options = await getAxoisRequestHeaders();
      const response = await axiosPrivate.get(
        `employee/comments/${commentId}/replies`,
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /** Authors only — the API sets `isEdited` on success. */
  static updateComment = async (commentId: string, content: string) => {
    try {
      const options = await getAxoisRequestHeaders(Constant.PUT_REQUEST);
      const response = await axiosPrivate.put(
        `employee/comments/${commentId}`,
        { content },
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /** Soft delete. Also decrements the task's comment count server side. */
  static deleteComment = async (commentId: string) => {
    try {
      const options = await getAxoisRequestHeaders(Constant.DELETE_REQUEST);
      const response = await axiosPrivate.delete(
        `employee/comments/${commentId}`,
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /** Members of the task's project, for the @-mention picker. */
  static getMentionableUsers = async (taskId: string) => {
    try {
      const options = await getAxoisRequestHeaders();
      const response = await axiosPrivate.get(
        `employee/tasks/${taskId}/mentionable`,
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };
}
