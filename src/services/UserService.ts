import { axiosPrivate, axiosPublic } from "../axios/Axios";
import { Configs } from "../configs/Configs";
import Constant from "../configs/Constant";
import { getAxoisRequestHeaders } from "../utils/Utils";

/** Network failures have no `response`, so read the API message defensively. */
const getErrorMessage = (error: any) =>
  error?.response?.data?.message ??
  error?.message ??
  "Something went wrong. Please try again.";

export default class UserService {
  static registerUser = async (reqData = {}) => {
    try {
      const response = await axiosPublic.post(
        `employee/auth/register`,
        reqData,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  static loginUser = async (reqData = {}) => {
    try {
      const response = await axiosPublic.post(`employee/auth/login`, reqData);
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  static getUserData = async () => {
    try {
      const options = await getAxoisRequestHeaders();
      const response = await axiosPrivate.get(`employee/auth/initialize`, {
        headers: options,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  static logoutUser = async (reqData = {}) => {
    try {
      const options = await getAxoisRequestHeaders(Constant.POST_REQUEST);
      const response = await axiosPrivate.post(
        `employee/auth/logout`,
        reqData,
        {
          headers: options,
        },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  static changePassword = async (reqData = {}) => {
    try {
      const options = await getAxoisRequestHeaders(Constant.POST_REQUEST);
      const response = await axiosPrivate.post(
        `employee/auth/change-password`,
        reqData,
        {
          headers: options,
        },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /** Step 1 of the reset flow. Always resolves 200, even for unknown emails. */
  static forgotPassword = async (reqData = {}) => {
    try {
      const response = await axiosPublic.post(
        `employee/auth/forgot-password`,
        reqData,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /** Step 2. Trades a correct OTP for the single-use reset token. */
  static verifyResetOtp = async (reqData = {}) => {
    try {
      const response = await axiosPublic.post(
        `employee/auth/verify-reset-otp`,
        reqData,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /** Step 3. Takes the token from verifyResetOtp — never the OTP itself. */
  static resetPassword = async (reqData = {}) => {
    try {
      const response = await axiosPublic.post(
        `employee/auth/reset-password`,
        reqData,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };
}
