import { axiosPrivate, axiosPublic } from "../axios/Axios";
import { getAxoisRequestHeaders } from "../utils/Utils";

export default class TaskService {
  static taskList = async (page: number, limit: number, status?: string) => {
    try {
      const options = await getAxoisRequestHeaders();

      const response = await axiosPrivate.get(
        `tasks/list?page=${page}&limit=${limit}${
          status && `&status=${status}`
        }`,
        {
          headers: options,
        },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response.data.message);
    }
  };

  static createTask = async (reqBody = {}) => {
    try {
      const options = await getAxoisRequestHeaders();

      const response = await axiosPrivate.post(`tasks/create`, reqBody, {
        headers: options,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response.data.message);
    }
  };
}
