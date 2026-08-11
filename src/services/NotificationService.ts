import { axiosPrivate } from "../axios/Axios";
import Constant from "../configs/Constant";
import { getAxoisRequestHeaders } from "../utils/Utils";

/** Network failures have no `response`, so read the API message defensively. */
const getErrorMessage = (error: any) =>
  error?.response?.data?.message ??
  error?.message ??
  "Something went wrong. Please try again.";

export type NotificationListParams = {
  isRead?: boolean;
  type?: string;
  page?: number;
  limit?: number;
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

/** Reachable while the account is still pending, so approvals can land. */
export default class NotificationService {
  static notificationList = async (params: NotificationListParams = {}) => {
    try {
      const options = await getAxoisRequestHeaders();
      const response = await axiosPrivate.get(
        `employee/notifications${toQueryString(params)}`,
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  static getUnreadCount = async () => {
    try {
      const options = await getAxoisRequestHeaders();
      const response = await axiosPrivate.get(
        `employee/notifications/unread-count`,
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  static markAsRead = async (notificationId: string) => {
    try {
      const options = await getAxoisRequestHeaders(Constant.PUT_REQUEST);
      const response = await axiosPrivate.put(
        `employee/notifications/${notificationId}/read`,
        {},
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  static markAllAsRead = async () => {
    try {
      const options = await getAxoisRequestHeaders(Constant.PUT_REQUEST);
      const response = await axiosPrivate.put(
        `employee/notifications/read-all`,
        {},
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  static deleteNotification = async (notificationId: string) => {
    try {
      const options = await getAxoisRequestHeaders(Constant.DELETE_REQUEST);
      const response = await axiosPrivate.delete(
        `employee/notifications/${notificationId}`,
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /** Clears the already-read backlog in one call. */
  static clearReadNotifications = async () => {
    try {
      const options = await getAxoisRequestHeaders(Constant.DELETE_REQUEST);
      const response = await axiosPrivate.delete(
        `employee/notifications/read`,
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };
}
