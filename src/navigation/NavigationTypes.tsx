import type { NavigatorScreenParams } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { StackScreenProps } from "@react-navigation/stack";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { TaskStatus } from "../models/task";

/** Tabs used by the Tasks screen, plus the pseudo-tabs the dashboard links to. */
export type TaskFilter = TaskStatus | "all" | "my-tasks" | "created";

export type BottomTabsParamList = {
  Home: undefined;
  Projects: undefined;
  Tasks: { filter?: TaskFilter } | undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;

  // Authentication
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  /** `token` comes from verify-reset-otp — reset-password won't take the OTP. */
  ResetPassword: { email?: string; token?: string } | undefined;
  PendingApproval: undefined;
  AccountSuspended: undefined;

  // Main
  MainTabs: NavigatorScreenParams<BottomTabsParamList>;

  // Projects
  ProjectDetails: { projectId: string };
  ProjectMembers: { projectId: string };

  // Tasks
  TaskDetails: { taskId: string };
  CreateTask: { projectId?: string; taskId?: string } | undefined;
  TaskComments: { taskId: string };
  TaskActivity: { taskId: string };
  MyTasks: undefined;

  // Approvals
  PendingApprovals: undefined;
  ApprovalDetails: { taskId: string };
  RejectTask: { taskId: string; mode: "reject" | "return" };

  // Notifications
  NotificationDetails: { notificationId: string };

  // User
  EditProfile: undefined;
  MyPerformance: undefined;
  OrganizationInfo: undefined;
  Settings: undefined;
  ChangePassword: undefined;

  // Team (Team Lead / Manager)
  MyTeam: undefined;
  TeamMemberDetails: { userId: string };
  TeamTasks: undefined;
  TeamWorkload: undefined;
};

type TabProps<T extends keyof BottomTabsParamList> = CompositeScreenProps<
  BottomTabScreenProps<BottomTabsParamList, T>,
  StackScreenProps<RootStackParamList>
>;

export type HomeScreenProps = TabProps<"Home">;
export type ProjectsScreenProps = TabProps<"Projects">;
export type TasksScreenProps = TabProps<"Tasks">;
export type NotificationsScreenProps = TabProps<"Notifications">;
export type ProfileScreenProps = TabProps<"Profile">;

export type SplashScreenProps = StackScreenProps<RootStackParamList, "Splash">;
export type WelcomeScreenProps = StackScreenProps<
  RootStackParamList,
  "Welcome"
>;
export type SignInScreenProps = StackScreenProps<RootStackParamList, "SignIn">;
export type SignUpScreenProps = StackScreenProps<RootStackParamList, "SignUp">;
export type ForgotPasswordScreenProps = StackScreenProps<
  RootStackParamList,
  "ForgotPassword"
>;
export type ResetPasswordScreenProps = StackScreenProps<
  RootStackParamList,
  "ResetPassword"
>;
export type PendingApprovalScreenProps = StackScreenProps<
  RootStackParamList,
  "PendingApproval"
>;
export type AccountSuspendedScreenProps = StackScreenProps<
  RootStackParamList,
  "AccountSuspended"
>;

export type ProjectDetailsScreenProps = StackScreenProps<
  RootStackParamList,
  "ProjectDetails"
>;
export type ProjectMembersScreenProps = StackScreenProps<
  RootStackParamList,
  "ProjectMembers"
>;

export type TaskDetailsScreenProps = StackScreenProps<
  RootStackParamList,
  "TaskDetails"
>;
export type CreateTaskScreenProps = StackScreenProps<
  RootStackParamList,
  "CreateTask"
>;
export type TaskCommentsScreenProps = StackScreenProps<
  RootStackParamList,
  "TaskComments"
>;
export type TaskActivityScreenProps = StackScreenProps<
  RootStackParamList,
  "TaskActivity"
>;
export type MyTasksScreenProps = StackScreenProps<
  RootStackParamList,
  "MyTasks"
>;

export type PendingApprovalsScreenProps = StackScreenProps<
  RootStackParamList,
  "PendingApprovals"
>;
export type ApprovalDetailsScreenProps = StackScreenProps<
  RootStackParamList,
  "ApprovalDetails"
>;
export type RejectTaskScreenProps = StackScreenProps<
  RootStackParamList,
  "RejectTask"
>;

export type NotificationDetailsScreenProps = StackScreenProps<
  RootStackParamList,
  "NotificationDetails"
>;

export type EditProfileScreenProps = StackScreenProps<
  RootStackParamList,
  "EditProfile"
>;
export type MyPerformanceScreenProps = StackScreenProps<
  RootStackParamList,
  "MyPerformance"
>;
export type OrganizationInfoScreenProps = StackScreenProps<
  RootStackParamList,
  "OrganizationInfo"
>;
export type SettingsScreenProps = StackScreenProps<
  RootStackParamList,
  "Settings"
>;
export type ChangePasswordScreenProps = StackScreenProps<
  RootStackParamList,
  "ChangePassword"
>;

export type MyTeamScreenProps = StackScreenProps<RootStackParamList, "MyTeam">;
export type TeamMemberDetailsScreenProps = StackScreenProps<
  RootStackParamList,
  "TeamMemberDetails"
>;
export type TeamTasksScreenProps = StackScreenProps<
  RootStackParamList,
  "TeamTasks"
>;
export type TeamWorkloadScreenProps = StackScreenProps<
  RootStackParamList,
  "TeamWorkload"
>;
