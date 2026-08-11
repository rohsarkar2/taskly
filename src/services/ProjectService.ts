import { axiosPrivate } from "../axios/Axios";
import { getAxoisRequestHeaders } from "../utils/Utils";

/** Network failures have no `response`, so read the API message defensively. */
const getErrorMessage = (error: any) =>
  error?.response?.data?.message ??
  error?.message ??
  "Something went wrong. Please try again.";

export type ProjectListParams = {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "createdAt" | "endDate" | "priority";
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

/**
 * Only projects you are a member of are visible — anything else answers 403.
 * Every route here also requires an approved account.
 */
export default class ProjectService {
  static projectList = async (params: ProjectListParams = {}) => {
    try {
      const options = await getAxoisRequestHeaders();
      const response = await axiosPrivate.get(
        `employee/projects${toQueryString(params)}`,
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /** Returns the project plus its effective workflow and task stats. */
  static getProjectDetails = async (projectId: string) => {
    try {
      const options = await getAxoisRequestHeaders();
      const response = await axiosPrivate.get(`employee/projects/${projectId}`, {
        headers: options,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  static getProjectMembers = async (projectId: string) => {
    try {
      const options = await getAxoisRequestHeaders();
      const response = await axiosPrivate.get(
        `employee/projects/${projectId}/members`,
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  static getProjectTimeline = async (projectId: string, limit = 20) => {
    try {
      const options = await getAxoisRequestHeaders();
      const response = await axiosPrivate.get(
        `employee/projects/${projectId}/timeline?limit=${limit}`,
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };
}
