import { axiosPrivate, axiosPublic } from "../axios/Axios";
import { getAxoisRequestHeaders } from "../utils/Utils";

export default class UserService {
  static registerUser = async (reqData = {}) => {
    try {
      const response = await axiosPublic.post(`users/register`, reqData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response.data.message);
    }
  };

  static loginUser = async (reqData = {}) => {
    try {
      const response = await axiosPublic.post(`users/login`, reqData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response.data.message);
    }
  };

  static getUserData = async () => {
    try {
      const options = await getAxoisRequestHeaders();
      const response = await axiosPrivate.get(`users/initialize`, {
        headers: options,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response.data.message);
    }
  };
}
