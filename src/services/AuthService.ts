import { getRefreshToken } from "../utils/Utils";
import { axiosPrivate } from "../axios/Axios";

export default class AuthService {
  static getRefreshToken = async () => {
    try {
      const token = await getRefreshToken();
      const response = await axiosPrivate.get(`users/refresh-token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response.data.message);
    }
  };
}
