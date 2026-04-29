import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserDataModel } from "../../models/user";

export type UserState = {
  userData: UserDataModel | null;
};

export const initialUserState: UserState = {
  userData: null,
};

const userSlice = createSlice({
  name: "user",
  initialState: initialUserState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserDataModel>) => {
      state.userData = action.payload;
    },
    clearUserData: (state) => {
      state.userData = null;
    },
  },
});

export const { setUserData, clearUserData } = userSlice.actions;

export default userSlice.reducer;
