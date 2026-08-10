import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Badge,
  Container,
  Header,
  ListRow,
  OptionSheet,
  WhiteContainer,
} from "../components";
import type { SheetOption } from "../components";
import Colors from "../configs/Colors";
import Constant from "../configs/Constant";
import { UserRole } from "../models/user";
import { SettingsScreenProps } from "../navigation/NavigationTypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearUserData, setUserRole } from "../store/slices/userSlice";
import { getUserRoleMeta } from "../utils/Formatters";

const ROLE_OPTIONS: SheetOption[] = (
  ["team-member", "team-lead", "manager"] as UserRole[]
).map((role) => ({
  key: role,
  label: getUserRoleMeta(role).label,
  description:
    role === "team-member"
      ? "Create and work on tasks"
      : role === "team-lead"
      ? "Adds team views and approvals"
      : "Adds broader project and team management",
  icon: "person-outline",
}));

const THEME_OPTIONS: SheetOption[] = [
  { key: "system", label: "Match system", icon: "phone-portrait-outline" },
  { key: "light", label: "Light", icon: "sunny-outline" },
  { key: "dark", label: "Dark", icon: "moon-outline" },
];

const LANGUAGE_OPTIONS: SheetOption[] = Constant.AVAILABLE_LANGUAGES.map(
  (language) => ({
    key: language.code,
    label: language.name,
    icon: "language-outline",
  })
);

const Settings: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.userData);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [taskAlerts, setTaskAlerts] = useState(true);
  const [approvalAlerts, setApprovalAlerts] = useState(true);
  const [mentionAlerts, setMentionAlerts] = useState(true);
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState(Constant.DEFAULT_LANGUAGE_CODE);
  const [openSheet, setOpenSheet] = useState<
    "role" | "theme" | "language" | null
  >(null);

  const handleSignOut = (allDevices = false) => {
    Alert.alert(
      allDevices ? "Sign out everywhere" : "Sign Out",
      allDevices
        ? "You'll be signed out on every device where you're logged in."
        : "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => {
            dispatch(clearUserData());
            navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
          },
        },
      ]
    );
  };

  const renderSwitch = (value: boolean, onChange: (next: boolean) => void) => (
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: Colors.borderGray, true: Colors.primary }}
      thumbColor={Colors.white}
    />
  );

  return (
    <Container>
      <Header title="Settings" showBack />
      <WhiteContainer style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Account */}
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.group}>
            <ListRow
              icon="create-outline"
              title="Edit Profile"
              onPress={() => navigation.navigate("EditProfile")}
            />
            <View style={styles.divider} />
            <ListRow
              icon="lock-closed-outline"
              title="Change Password"
              onPress={() => navigation.navigate("ChangePassword")}
            />
            <View style={styles.divider} />
            <ListRow
              icon="business-outline"
              title="Organization"
              onPress={() => navigation.navigate("OrganizationInfo")}
            />
          </View>

          {/* Notifications */}
          <Text style={styles.sectionLabel}>Notifications</Text>
          <View style={styles.group}>
            <ListRow
              icon="notifications-outline"
              title="Push notifications"
              right={renderSwitch(pushEnabled, setPushEnabled)}
            />
            <View style={styles.divider} />
            <ListRow
              icon="checkbox-outline"
              title="Task assignments"
              right={renderSwitch(taskAlerts, setTaskAlerts)}
            />
            <View style={styles.divider} />
            <ListRow
              icon="shield-checkmark-outline"
              title="Approvals"
              right={renderSwitch(approvalAlerts, setApprovalAlerts)}
            />
            <View style={styles.divider} />
            <ListRow
              icon="at-outline"
              title="Mentions and comments"
              right={renderSwitch(mentionAlerts, setMentionAlerts)}
            />
          </View>

          {/* App */}
          <Text style={styles.sectionLabel}>App</Text>
          <View style={styles.group}>
            <ListRow
              icon="color-palette-outline"
              title="Theme"
              value={
                THEME_OPTIONS.find((option) => option.key === theme)?.label
              }
              onPress={() => setOpenSheet("theme")}
            />
            <View style={styles.divider} />
            <ListRow
              icon="language-outline"
              title="Language"
              value={
                LANGUAGE_OPTIONS.find((option) => option.key === language)
                  ?.label
              }
              onPress={() => setOpenSheet("language")}
            />
            <View style={styles.divider} />
            <ListRow
              icon="information-circle-outline"
              title="About Taskly"
              onPress={() =>
                Alert.alert(
                  "About Taskly",
                  "Taskly v0.0.1 — projects, tasks and approvals for your team."
                )
              }
            />
          </View>

          {/* Preview role — static build only */}
          <Text style={styles.sectionLabel}>Preview</Text>
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => setOpenSheet("role")}
            activeOpacity={0.7}
          >
            <View style={styles.roleText}>
              <Text style={styles.roleTitle}>Preview as role</Text>
              <Text style={styles.roleSubtitle}>
                Switches which screens and actions are visible. Permissions
                still come from the backend once the API is wired up.
              </Text>
            </View>
            {user ? (
              <Badge meta={getUserRoleMeta(user.role)} size="small" />
            ) : null}
          </TouchableOpacity>

          {/* Security */}
          <Text style={styles.sectionLabel}>Security</Text>
          <View style={styles.group}>
            <ListRow
              icon="log-out-outline"
              title="Sign Out"
              destructive
              showChevron={false}
              onPress={() => handleSignOut(false)}
            />
            <View style={styles.divider} />
            <ListRow
              icon="phone-portrait-outline"
              title="Sign out from all devices"
              destructive
              showChevron={false}
              onPress={() => handleSignOut(true)}
            />
          </View>
        </ScrollView>
      </WhiteContainer>

      <OptionSheet
        visible={openSheet === "role"}
        title="Preview as"
        options={ROLE_OPTIONS}
        selectedKey={user?.role}
        onSelect={(option) => {
          dispatch(setUserRole(option.key as UserRole));
          setOpenSheet(null);
        }}
        onClose={() => setOpenSheet(null)}
      />

      <OptionSheet
        visible={openSheet === "theme"}
        title="Theme"
        options={THEME_OPTIONS}
        selectedKey={theme}
        onSelect={(option) => {
          setTheme(option.key);
          setOpenSheet(null);
        }}
        onClose={() => setOpenSheet(null)}
      />

      <OptionSheet
        visible={openSheet === "language"}
        title="Language"
        options={LANGUAGE_OPTIONS}
        selectedKey={language}
        onSelect={(option) => {
          setLanguage(option.key);
          setOpenSheet(null);
        }}
        onClose={() => setOpenSheet(null)}
      />
    </Container>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  content: {
    paddingBottom: 48,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.mutedFont,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 10,
  },
  group: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    paddingHorizontal: 14,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.leaderboardBorderVeryLight,
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    padding: 16,
  },
  roleText: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primary,
  },
  roleSubtitle: {
    fontSize: 12,
    color: Colors.secondaryFont,
    lineHeight: 17,
    marginTop: 4,
  },
});
