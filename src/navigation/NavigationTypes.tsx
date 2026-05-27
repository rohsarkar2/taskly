import type { NavigatorScreenParams } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { StackScreenProps } from "@react-navigation/stack";
import type { CompositeScreenProps } from "@react-navigation/native";

export type BottomTabsParamList = {
  Home: undefined;
  Tasks: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  HomeTab: NavigatorScreenParams<BottomTabsParamList>;
  SignIn: undefined;
  SignUp: undefined;
  CreateTask: undefined;
};

export type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabsParamList, "Home">,
  StackScreenProps<RootStackParamList>
>;

export type SettingsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabsParamList, "Settings">,
  StackScreenProps<RootStackParamList>
>;

export type TasksScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabsParamList, "Tasks">,
  StackScreenProps<RootStackParamList>
>;

export type SignInScreenProps = StackScreenProps<RootStackParamList, "SignIn">;

export type SignUpScreenProps = StackScreenProps<RootStackParamList, "SignUp">;

export type CreateTaskScreenProps = StackScreenProps<
  RootStackParamList,
  "CreateTask"
>;
