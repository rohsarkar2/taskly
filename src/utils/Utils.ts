import * as Keychain from "react-native-keychain";
import Constant from "../configs/Constant";

const ACCESS_TOKEN_KEY = "tourish_app_user_token";
const REFRESH_TOKEN_KEY = "tourish_app_user_refresh_token";
const ACCESS_TOKEN_SERVICE = "accessTokenService";
const REFRESH_TOKEN_SERVICE = "refreshTokenService";

// Save Access Token
export const saveAccessToken = async (token: string) => {
  try {
    await Keychain.setGenericPassword(ACCESS_TOKEN_KEY, token, {
      service: ACCESS_TOKEN_SERVICE,
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Get Access Token
export const getAccessToken = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: ACCESS_TOKEN_SERVICE,
    });
    if (credentials && credentials.username === ACCESS_TOKEN_KEY) {
      return credentials.password;
    }
    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Remove Access Token
export const removeAccessToken = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: ACCESS_TOKEN_SERVICE,
    });
    if (credentials && credentials.username === ACCESS_TOKEN_KEY) {
      await Keychain.resetGenericPassword({ service: ACCESS_TOKEN_SERVICE });
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Save Refresh Token
export const saveRefreshToken = async (token: string) => {
  try {
    await Keychain.setGenericPassword(REFRESH_TOKEN_KEY, token, {
      service: REFRESH_TOKEN_SERVICE,
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Get Refresh Token
export const getRefreshToken = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: REFRESH_TOKEN_SERVICE,
    });
    if (credentials && credentials.username === REFRESH_TOKEN_KEY) {
      return credentials.password;
    }
    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Remove Refresh Token
export const removeRefreshToken = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: REFRESH_TOKEN_SERVICE,
    });
    if (credentials && credentials.username === REFRESH_TOKEN_KEY) {
      await Keychain.resetGenericPassword({ service: REFRESH_TOKEN_SERVICE });
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Clear All Tokens (Access and Refresh)
export const clearAllTokens = async () => {
  try {
    await removeAccessToken();
    await removeRefreshToken();
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAxoisRequestHeaders = async (
  reqMethod = Constant.GET_REQUEST,
  isFormData = false,
) => {
  const token = await getAccessToken();
  console.log("Access Token:", token);
  let headers = null;

  if (reqMethod === Constant.GET_REQUEST) {
    headers = {
      Authorization: `Bearer ${token}`,
    };
  } else {
    headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": isFormData
        ? Constant.CONTENT_TYPE_FORMDATA
        : Constant.CONTENT_TYPE_JSON,
    };
  }

  return headers;
};
