import { getRefreshToken } from "../utils/Utils";
import { axiosPublic } from "../axios/Axios";

export default class AuthService {
  /**
   * Rotates the token pair. Nothing calls this today — the axios response
   * interceptor refreshes inline — but it stays in step with that logic.
   */
  static refreshToken = async () => {
    try {
      const token = await getRefreshToken();
      const response = await axiosPublic.post(`employee/auth/refresh-token`, {
        refreshToken: token,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ??
          error?.message ??
          "Something went wrong. Please try again.",
      );
    }
  };
}
