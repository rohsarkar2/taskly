export type UserRole = "team-member" | "team-lead" | "manager";

export type UserStatus = "active" | "pending" | "suspended";

export type UserModel = {
  id: string;
  name: string;
  email: string;
  image: string;
  role: UserRole;
  status: UserStatus;
  jobTitle: string;
  phoneNumber?: string;
  organizationId: string;
  joinedAt: string; // ISO string format
};

export type UserDataModel = UserModel & {
  accessToken: string;
  refreshToken: string;
};
