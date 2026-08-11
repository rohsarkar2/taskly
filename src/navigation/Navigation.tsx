import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  CardStyleInterpolators,
  createStackNavigator,
} from "@react-navigation/stack";
import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { BottomTabsParamList, RootStackParamList } from "./NavigationTypes";
import Colors from "../configs/Colors";
import NotificationService from "../services/NotificationService";

// Authentication
import Splash from "../screens/Splash";
import Welcome from "../screens/Welcome";
import SignIn from "../screens/SignIn";
import SignUp from "../screens/SignUp";
import ForgotPassword from "../screens/ForgotPassword";
import ResetPassword from "../screens/ResetPassword";
import PendingApproval from "../screens/PendingApproval";
import AccountSuspended from "../screens/AccountSuspended";

// Tabs
import Home from "../screens/Home";
import Projects from "../screens/Projects";
import Tasks from "../screens/Tasks";
import Notifications from "../screens/Notifications";
import Profile from "../screens/Profile";

// Projects
import ProjectDetails from "../screens/ProjectDetails";
import ProjectMembers from "../screens/ProjectMembers";

// Tasks
import TaskDetails from "../screens/TaskDetails";
import CreateTask from "../screens/CreateTask";
import TaskComments from "../screens/TaskComments";
import TaskActivity from "../screens/TaskActivity";
import MyTasks from "../screens/MyTasks";

// Approvals
import PendingApprovals from "../screens/PendingApprovals";
import ApprovalDetails from "../screens/ApprovalDetails";
import RejectTask from "../screens/RejectTask";

// Notifications
import NotificationDetails from "../screens/NotificationDetails";

// User
import EditProfile from "../screens/EditProfile";
import MyPerformance from "../screens/MyPerformance";
import OrganizationInfo from "../screens/OrganizationInfo";
import Settings from "../screens/Settings";
import ChangePassword from "../screens/ChangePassword";

// Team
import MyTeam from "../screens/MyTeam";
import TeamMemberDetails from "../screens/TeamMemberDetails";
import TeamTasks from "../screens/TeamTasks";
import TeamWorkload from "../screens/TeamWorkload";

const RootStack = createStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<BottomTabsParamList>();

const tabIcons = {
  Home: { active: "home", inactive: "home-outline" },
  Projects: { active: "folder-open", inactive: "folder-open-outline" },
  Tasks: { active: "checkbox", inactive: "checkbox-outline" },
  Notifications: { active: "notifications", inactive: "notifications-outline" },
  Profile: { active: "person-circle", inactive: "person-circle-outline" },
} as const;

function TabBarIcon({
  routeName,
  focused,
  color,
  size,
  unreadCount,
}: {
  routeName: keyof BottomTabsParamList;
  focused: boolean;
  color: string;
  size: number;
  unreadCount: number;
}) {
  const iconName = tabIcons[routeName][focused ? "active" : "inactive"];
  const showBadge = routeName === "Notifications" && unreadCount > 0;

  return (
    <View>
      <Ionicons name={iconName} size={size ?? 22} color={color} />
      {showBadge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function useUnreadNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        try {
          const response = await NotificationService.getUnreadCount();
          if (active) {
            setUnreadCount(response?.data?.unreadCount ?? 0);
          }
        } catch {
          // No badge is better than blocking the tab bar on a failed call.
        }
      })();

      return () => {
        active = false;
      };
    }, []),
  );

  return unreadCount;
}

function TabsNavigator() {
  const unreadCount = useUnreadNotificationCount();

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.mutedFont,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.borderGray,
        },
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon
            routeName={route.name}
            focused={focused}
            color={color}
            size={size}
            unreadCount={unreadCount}
          />
        ),
      })}
    >
      <Tabs.Screen name="Home" component={Home} />
      <Tabs.Screen name="Projects" component={Projects} />
      <Tabs.Screen name="Tasks" component={Tasks} />
      <Tabs.Screen name="Notifications" component={Notifications} />
      <Tabs.Screen name="Profile" component={Profile} />
    </Tabs.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      >
        <RootStack.Screen
          name="Splash"
          component={Splash}
          options={{ gestureEnabled: false }}
        />

        {/* Authentication */}
        <RootStack.Screen name="Welcome" component={Welcome} />
        <RootStack.Screen name="SignIn" component={SignIn} />
        <RootStack.Screen name="SignUp" component={SignUp} />
        <RootStack.Screen name="ForgotPassword" component={ForgotPassword} />
        <RootStack.Screen name="ResetPassword" component={ResetPassword} />
        <RootStack.Screen name="PendingApproval" component={PendingApproval} />
        <RootStack.Screen
          name="AccountSuspended"
          component={AccountSuspended}
        />

        {/* Main */}
        <RootStack.Screen name="MainTabs" component={TabsNavigator} />

        {/* Projects */}
        <RootStack.Screen name="ProjectDetails" component={ProjectDetails} />
        <RootStack.Screen name="ProjectMembers" component={ProjectMembers} />

        {/* Tasks */}
        <RootStack.Screen name="TaskDetails" component={TaskDetails} />
        <RootStack.Screen name="CreateTask" component={CreateTask} />
        <RootStack.Screen name="TaskComments" component={TaskComments} />
        <RootStack.Screen name="TaskActivity" component={TaskActivity} />
        <RootStack.Screen name="MyTasks" component={MyTasks} />

        {/* Approvals */}
        <RootStack.Screen
          name="PendingApprovals"
          component={PendingApprovals}
        />
        <RootStack.Screen name="ApprovalDetails" component={ApprovalDetails} />
        <RootStack.Screen
          name="RejectTask"
          component={RejectTask}
          options={{
            cardStyleInterpolator:
              CardStyleInterpolators.forModalPresentationIOS,
          }}
        />

        {/* Notifications */}
        <RootStack.Screen
          name="NotificationDetails"
          component={NotificationDetails}
        />

        {/* User */}
        <RootStack.Screen name="EditProfile" component={EditProfile} />
        <RootStack.Screen name="MyPerformance" component={MyPerformance} />
        <RootStack.Screen
          name="OrganizationInfo"
          component={OrganizationInfo}
        />
        <RootStack.Screen name="Settings" component={Settings} />
        <RootStack.Screen name="ChangePassword" component={ChangePassword} />

        {/* Team */}
        <RootStack.Screen name="MyTeam" component={MyTeam} />
        <RootStack.Screen
          name="TeamMemberDetails"
          component={TeamMemberDetails}
        />
        <RootStack.Screen name="TeamTasks" component={TeamTasks} />
        <RootStack.Screen name="TeamWorkload" component={TeamWorkload} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: Colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "700",
  },
});
