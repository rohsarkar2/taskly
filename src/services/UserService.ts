import { axiosPrivate, axiosPublic } from "../axios/Axios";
import { Configs } from "../configs/Configs";
import Constant from "../configs/Constant";
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

  static logoutUser = async (reqData = {}) => {
    try {
      const options = await getAxoisRequestHeaders(Constant.POST_REQUEST);
      const response = await axiosPrivate.post(`users/logout`, reqData, {
        headers: options,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response.data.message);
    }
  };
}
