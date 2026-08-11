import { axiosPrivate } from "../axios/Axios";
import { getAxoisRequestHeaders } from "../utils/Utils";

/** Network failures have no `response`, so read the API message defensively. */
const getErrorMessage = (error: any) =>
  error?.response?.data?.message ??
  error?.message ??
  "Something went wrong. Please try again.";

/** Every dashboard route requires an approved account. */
export default class DashboardService {
  /** Summary counters, today's tasks and recent activity in one round trip. */
  static getDashboard = async () => {
    try {
      const options = await getAxoisRequestHeaders();
      const response = await axiosPrivate.get(`employee/dashboard`, {
        headers: options,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /** `days` defaults to 7 server-side and is capped at 90. */
  static getUpcomingTasks = async (days = 7) => {
    try {
      const options = await getAxoisRequestHeaders();
      const response = await axiosPrivate.get(
        `employee/dashboard/upcoming?days=${days}`,
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /** Your open work grouped by project. */
  static getWorkload = async () => {
    try {
      const options = await getAxoisRequestHeaders();
      const response = await axiosPrivate.get(`employee/dashboard/workload`, {
        headers: options,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };
}
