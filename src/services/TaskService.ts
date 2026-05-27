import { axiosPrivate, axiosPublic } from "../axios/Axios";
import { getAxoisRequestHeaders } from "../utils/Utils";

export default class TaskService {
  static taskList = async () => {
    try {
      const options = await getAxoisRequestHeaders();

      const response = await axiosPrivate.get(`tasks/list`, {
        headers: options,
      });
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
