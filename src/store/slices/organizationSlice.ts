import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OrganizationSummaryModel } from "../../models/organization";

export type OrganizationState = {
  organizationData: OrganizationSummaryModel | null;
};

export const initialOrganizationState: OrganizationState = {
  organizationData: null,
};

const organizationSlice = createSlice({
  name: "organization",
  initialState: initialOrganizationState,
  reducers: {
    setOrganizationData: (
      state,
      action: PayloadAction<OrganizationSummaryModel>,
    ) => {
      state.organizationData = action.payload;
    },
    clearOrganizationData: (state) => {
      state.organizationData = null;
    },
  },
});

export const { setOrganizationData, clearOrganizationData } =
  organizationSlice.actions;

export default organizationSlice.reducer;
