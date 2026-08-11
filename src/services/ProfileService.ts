import { axiosPrivate } from "../axios/Axios";
import Constant from "../configs/Constant";
import { getAxoisRequestHeaders } from "../utils/Utils";

/** Network failures have no `response`, so read the API message defensively. */
const getErrorMessage = (error: any) =>
  error?.response?.data?.message ??
  error?.message ??
  "Something went wrong. Please try again.";

export type AvatarUpload = {
  uri: string;
  name?: string;
  type?: string;
};

export default class ProfileService {
  /** Reachable while the account is still pending. */
  static getProfile = async () => {
    try {
      const options = await getAxoisRequestHeaders();
      const response = await axiosPrivate.get(`employee/profile`, {
        headers: options,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /** Accepts any subset of the editable fields — `role` and `status` are not. */
  static updateProfile = async (reqData = {}) => {
    try {
      const options = await getAxoisRequestHeaders(Constant.PUT_REQUEST);
      const response = await axiosPrivate.put(`employee/profile`, reqData, {
        headers: options,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  static uploadAvatar = async (file: AvatarUpload) => {
    try {
      const options = await getAxoisRequestHeaders(Constant.POST_REQUEST, true);
      const formData = new FormData();
      formData.append("avatar", {
        uri: file.uri,
        name: file.name ?? "avatar.jpg",
        type: file.type ?? "image/jpeg",
      } as any);

      const response = await axiosPrivate.post(
        `employee/profile/avatar`,
        formData,
        { headers: options },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /** Cheap poll for `{ role, status }` — used by the pending approval gate. */
  static getProfileRole = async () => {
    try {
      const options = await getAxoisRequestHeaders();
      const response = await axiosPrivate.get(`employee/profile/role`, {
        headers: options,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };

  /** Requires an approved account — pending users get a 403 here. */
  static getOrganization = async () => {
    try {
      const options = await getAxoisRequestHeaders();
      const response = await axiosPrivate.get(`employee/organization`, {
        headers: options,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  };
}
