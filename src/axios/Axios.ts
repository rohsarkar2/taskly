import axios from "axios";
import { Configs } from "../configs/Configs";
import {
  getRefreshToken,
  saveAccessToken,
  saveRefreshToken,
  clearAllTokens,
} from "../utils/Utils";

export const axiosPublic = axios.create({
  baseURL: Configs.TASKLY_BASE_URL,
});

export const axiosPrivate = axios.create({
  baseURL: Configs.TASKLY_BASE_URL,
});

// Add response interceptor to handle token refresh
axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          await clearAllTokens();
          return Promise.reject(error);
        }

        // Get new access token
        const response = await axiosPrivate.get(
          `${Configs.TASKLY_BASE_URL}users/refresh-token`,
          {
            headers: { Authorization: `Bearer ${refreshToken}` },
          },
        );

        const newAccessToken = response.data?.accessToken;
        const newRefreshToken = response.data?.refreshToken;

        if (newAccessToken) {
          await saveAccessToken(newAccessToken);
          if (newRefreshToken) {
            await saveRefreshToken(newRefreshToken);
          }

          // Retry original request with new token
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axiosPrivate(originalRequest);
        }

        throw new Error("Invalid refresh response");
      } catch (refreshError) {
        await clearAllTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
