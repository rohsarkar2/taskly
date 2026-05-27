import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { SettingsScreenProps } from "../navigation/NavigationTypes";
import { Container, Header, WhiteContainer } from "../components";
import UserService from "../services/UserService";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearUserData } from "../store/slices/userSlice";
import { clearAllTokens } from "../utils/Utils";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../configs/Colors";

const Settings: React.FC<SettingsScreenProps> = (
  props: SettingsScreenProps,
) => {
  const user = useAppSelector((state) => state.user.userData);
  const dispatch = useAppDispatch();

  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await UserService.logoutUser({ email: user?.email });
            dispatch(clearUserData());
            clearAllTokens();
            props.navigation.navigate("SignIn");
          } catch (error: any) {
            console.error("Error during sign out:", error.message);
            Alert.alert("Error", "Failed to sign out. Please try again.");
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your tasks and data will be permanently deleted.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert("Info", "Account deletion feature coming soon!");
          },
        },
      ],
    );
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    rightElement,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={22} color={Colors.primary} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement ||
        (showArrow && (
          <Ionicons name="chevron-forward" size={20} color={Colors.mutedFont} />
        ))}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <Container>
      <Header title="Settings" />
      <WhiteContainer style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          {/* User Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || "User"}</Text>
              <Text style={styles.profileEmail}>
                {user?.email || "user@example.com"}
              </Text>
            </View>
          </View>

          {/* General Section */}
          <SectionHeader title="GENERAL" />
          <View style={styles.section}>
            <SettingItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="Receive push notifications"
              showArrow={false}
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: "#D1D5DB", true: Colors.primary + "40" }}
                  thumbColor={notificationsEnabled ? Colors.primary : "#F3F4F6"}
                />
              }
            />
            <View style={styles.divider} />
            <SettingItem
              icon="time-outline"
              title="Task Reminders"
              subtitle="Get reminded about due tasks"
              showArrow={false}
              rightElement={
                <Switch
                  value={reminderEnabled}
                  onValueChange={setReminderEnabled}
                  trackColor={{ false: "#D1D5DB", true: Colors.primary + "40" }}
                  thumbColor={reminderEnabled ? Colors.primary : "#F3F4F6"}
                />
              }
            />
            {/* <View style={styles.divider} /> */}
            {/* <SettingItem
              icon="moon-outline"
              title="Dark Mode"
              subtitle="Coming soon"
              showArrow={false}
              rightElement={
                <Switch
                  value={darkModeEnabled}
                  onValueChange={setDarkModeEnabled}
                  trackColor={{ false: "#D1D5DB", true: Colors.primary + "40" }}
                  thumbColor={darkModeEnabled ? Colors.primary : "#F3F4F6"}
                  disabled
                />
              }
            /> */}
          </View>

          {/* Task Preferences Section */}
          <SectionHeader title="TASK PREFERENCES" />
          <View style={styles.section}>
            <SettingItem
              icon="list-outline"
              title="Default Task Status"
              subtitle="Pending"
              onPress={() => Alert.alert("Info", "Feature coming soon!")}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="swap-vertical-outline"
              title="Sort Tasks By"
              subtitle="Due date"
              onPress={() => Alert.alert("Info", "Feature coming soon!")}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="archive-outline"
              title="Auto Archive"
              subtitle="Archive completed tasks after 30 days"
              onPress={() => Alert.alert("Info", "Feature coming soon!")}
            />
          </View>

          {/* Account Section */}
          <SectionHeader title="ACCOUNT" />
          <View style={styles.section}>
            <SettingItem
              icon="person-outline"
              title="Edit Profile"
              onPress={() => Alert.alert("Info", "Feature coming soon!")}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="lock-closed-outline"
              title="Change Password"
              onPress={() => Alert.alert("Info", "Feature coming soon!")}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="log-out-outline"
              title="Sign Out"
              onPress={handleSignOut}
            />
          </View>

          {/* About Section */}
          <SectionHeader title="ABOUT" />
          <View style={styles.section}>
            <SettingItem
              icon="information-circle-outline"
              title="App Version"
              subtitle="1.0.0"
              showArrow={false}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="help-circle-outline"
              title="Help & Support"
              onPress={() =>
                Alert.alert(
                  "Help & Support",
                  "Contact us at support@taskly.com",
                )
              }
            />
            <View style={styles.divider} />
            <SettingItem
              icon="document-text-outline"
              title="Privacy Policy"
              onPress={() =>
                Alert.alert("Info", "Privacy policy will be displayed here")
              }
            />
            <View style={styles.divider} />
            <SettingItem
              icon="shield-checkmark-outline"
              title="Terms of Service"
              onPress={() =>
                Alert.alert("Info", "Terms of service will be displayed here")
              }
            />
          </View>

          {/* Danger Zone */}
          <SectionHeader title="DANGER ZONE" />
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dangerItem}
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[styles.iconContainer, styles.dangerIconContainer]}
                >
                  <Ionicons name="trash-outline" size={22} color="#DC2626" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.dangerText}>Delete Account</Text>
                  <Text style={styles.settingSubtitle}>
                    Permanently delete your account and data
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#DC2626" />
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>Made with ❤️ for productivity</Text>
        </ScrollView>
      </WhiteContainer>
    </Container>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.borderGray,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.mutedFont,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.mutedFont,
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
    marginLeft: 4,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.black,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: Colors.mutedFont,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderGray,
  },
  dangerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  dangerIconContainer: {
    backgroundColor: "#FEE2E2",
  },
  dangerText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#DC2626",
    marginBottom: 2,
  },
  footer: {
    textAlign: "center",
    fontSize: 13,
    color: Colors.mutedFont,
    // marginTop: 8,
  },
});
