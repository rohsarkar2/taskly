import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;
const winWidth = Dimensions.get("window").width;
const winHeight = Dimensions.get("window").height;

const Constant = {
  POST_REQUEST: "POST",
  GET_REQUEST: "GET",
  PUT_REQUEST: "PUT",
  DELETE_REQUEST: "DELETE",
  CONTENT_TYPE_JSON: "application/json",
  CONTENT_TYPE_FORMDATA: "multipart/form-data",
  SCREEN_WIDTH: screenWidth,
  SCREEN_HEIGHT: screenHeight,
  WINDOW_WIDTH: winWidth,
  WINDOW_HEIGHT: winHeight,
  DEFAULT_LANGUAGE_CODE: "en",
  DEFAULT_LANGUAGE_NAME: "English",
  AVAILABLE_LANGUAGES: [{ code: "en", name: "English" }],
  PASSWORD_RULES: [
    { id: "1", name: "Length: 8", isMatched: false },
    { id: "2", name: "One Uppercase", isMatched: false },
    { id: "3", name: "One Lowercase", isMatched: false },
    { id: "4", name: "One Numeric", isMatched: false },
    { id: "5", name: "One Special Character", isMatched: false },
  ],
};

export default Constant;
