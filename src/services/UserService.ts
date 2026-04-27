import axios from "axios";
import { Configs } from "../configs/Configs";

export default class UserService {
  static registerUser = async (reqData = {}) => {
    try {
      const response = await axios.post(
        `${Configs.TASKLY_BASE_URL}/users/register`,
        reqData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  static loginUser = async (reqData = {}) => {
    try {
      const response = await axios.post(
        `${Configs.TASKLY_BASE_URL}/users/login`,
        reqData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      return response.status;
    } catch (error) {
      throw error;
    }
  };
}
