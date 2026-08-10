import { UserDataModel, UserModel } from "../models/user";

export const users: UserModel[] = [
  {
    id: "u-1",
    name: "Rohan Sarkar",
    email: "rohan.sarkar@abctech.com",
    image: "",
    role: "team-member",
    status: "active",
    jobTitle: "React Native Developer",
    phoneNumber: "+91 98300 11223",
    organizationId: "org-1",
    joinedAt: "2025-02-10T09:00:00.000Z",
  },
  {
    id: "u-2",
    name: "Priya Sharma",
    email: "priya.sharma@abctech.com",
    image: "",
    role: "team-lead",
    status: "active",
    jobTitle: "Engineering Lead",
    phoneNumber: "+91 98111 44556",
    organizationId: "org-1",
    joinedAt: "2024-06-02T09:00:00.000Z",
  },
  {
    id: "u-3",
    name: "Amit Das",
    email: "amit.das@abctech.com",
    image: "",
    role: "manager",
    status: "active",
    jobTitle: "Delivery Manager",
    phoneNumber: "+91 90070 88991",
    organizationId: "org-1",
    joinedAt: "2024-04-18T09:00:00.000Z",
  },
  {
    id: "u-4",
    name: "Sahil Gupta",
    email: "sahil.gupta@abctech.com",
    image: "",
    role: "team-member",
    status: "active",
    jobTitle: "Backend Developer",
    organizationId: "org-1",
    joinedAt: "2025-01-06T09:00:00.000Z",
  },
  {
    id: "u-5",
    name: "Ananya Iyer",
    email: "ananya.iyer@abctech.com",
    image: "",
    role: "team-member",
    status: "active",
    jobTitle: "Product Designer",
    organizationId: "org-1",
    joinedAt: "2025-03-24T09:00:00.000Z",
  },
  {
    id: "u-6",
    name: "Vikram Rao",
    email: "vikram.rao@abctech.com",
    image: "",
    role: "team-member",
    status: "active",
    jobTitle: "QA Engineer",
    organizationId: "org-1",
    joinedAt: "2025-05-12T09:00:00.000Z",
  },
  {
    id: "u-7",
    name: "Meera Nair",
    email: "meera.nair@abctech.com",
    image: "",
    role: "team-lead",
    status: "active",
    jobTitle: "Design Lead",
    organizationId: "org-1",
    joinedAt: "2024-09-30T09:00:00.000Z",
  },
  {
    id: "u-8",
    name: "Karthik Menon",
    email: "karthik.menon@abctech.com",
    image: "",
    role: "team-member",
    status: "active",
    jobTitle: "Frontend Developer",
    organizationId: "org-1",
    joinedAt: "2025-06-16T09:00:00.000Z",
  },
];

/**
 * The signed-in user for the static UI. Screens read the live copy from Redux
 * so the role switcher in Settings can preview the other role experiences.
 */
export const currentUser: UserDataModel = {
  ...users[0],
  accessToken: "static-access-token",
  refreshToken: "static-refresh-token",
};

export const getUserById = (id?: string | null): UserModel | undefined =>
  users.find((user) => user.id === id);

export const getUsersByIds = (ids: string[]): UserModel[] =>
  ids.map(getUserById).filter((user): user is UserModel => Boolean(user));
