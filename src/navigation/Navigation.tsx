import React from "react";
import {
  CardStyleInterpolators,
  createStackNavigator,
} from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { BottomTabsParamList, RootStackParamList } from "./NavigationTypes";
import Home from "../screens/Home";
import Activity from "../screens/Activity";
import SignIn from "../screens/SignIn";
import Colors from "../configs/Colors";
import SignUp from "../screens/SignUp";
import Settings from "../screens/Settings";

const RootStack = createStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<BottomTabsParamList>();

function TabsNavigator() {
  const tabIcons = {
    Home: {
      active: "home",
      inactive: "home-outline",
    },
    Activity: {
      active: "notifications",
      inactive: "notifications-outline",
    },
    Settings: {
      active: "settings",
      inactive: "settings-outline",
    },
  } as const;

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.mutedFont,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.borderGray,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const iconKey = focused ? "active" : "inactive";
          const iconName = tabIcons[route.name][iconKey];

          return <Ionicons name={iconName} size={size ?? 22} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Home" component={Home} />
      <Tabs.Screen name="Activity" component={Activity} />
      <Tabs.Screen name="Settings" component={Settings} />
    </Tabs.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      >
        <RootStack.Screen name="HomeTab" component={TabsNavigator} />
        <RootStack.Screen name="SignIn" component={SignIn} />
        <RootStack.Screen name="SignUp" component={SignUp} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
