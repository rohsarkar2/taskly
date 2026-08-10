import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserDataModel, UserRole, UserStatus } from "../../models/user";

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
    updateUserData: (state, action: PayloadAction<Partial<UserDataModel>>) => {
      if (state.userData) {
        state.userData = { ...state.userData, ...action.payload };
      }
    },
    /** Lets the static build preview the Team Lead / Manager experience. */
    setUserRole: (state, action: PayloadAction<UserRole>) => {
      if (state.userData) {
        state.userData.role = action.payload;
      }
    },
    setUserStatus: (state, action: PayloadAction<UserStatus>) => {
      if (state.userData) {
        state.userData.status = action.payload;
      }
    },
    clearUserData: (state) => {
      state.userData = null;
    },
  },
});

export const {
  setUserData,
  updateUserData,
  setUserRole,
  setUserStatus,
  clearUserData,
} = userSlice.actions;

export default userSlice.reducer;
