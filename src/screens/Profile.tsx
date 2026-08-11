import React, { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import {
  Avatar,
  Badge,
  Container,
  Header,
  ListRow,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import { DashboardSummaryModel } from "../models/dashboard";
import { ProfileScreenProps } from "../navigation/NavigationTypes";
import DashboardService from "../services/DashboardService";
import ProfileService from "../services/ProfileService";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearOrganizationData } from "../store/slices/organizationSlice";
import { clearUserData, updateUserData } from "../store/slices/userSlice";
import { endSession } from "../utils/Session";
import { getUserRoleMeta } from "../utils/Formatters";
import { mapApiUser, mapDashboardSummary } from "../utils/Mappers";

const Profile: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.userData);
  const organization = useAppSelector(
    (state) => state.organization.organizationData,
  );

  const [summary, setSummary] = useState<DashboardSummaryModel | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      // The profile is the source of truth for the identity block; the
      // dashboard summary backs the counters underneath it.
      (async () => {
        try {
          const response = await ProfileService.getProfile();
          if (active && response?.data?.user) {
            dispatch(updateUserData(mapApiUser(response.data.user)));
          }
        } catch {
          // Keep showing the persisted profile — nothing here is destructive.
        }

        try {
          const response = await DashboardService.getDashboard();
          if (active) {
            setSummary(mapDashboardSummary(response?.data?.summary));
          }
        } catch {
          // Counters stay blank rather than blocking the screen.
        }
      })();

      return () => {
        active = false;
      };
    }, [dispatch]),
  );

  const stats = {
    assigned: summary?.assignedTasks ?? 0,
    open: summary?.openTasks ?? 0,
    completed: summary?.completedTasks ?? 0,
  };

  const approvalCount = summary?.awaitingMyApproval ?? 0;
  const isApprover = user?.role === "team-lead" || user?.role === "manager";

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await endSession();
          dispatch(clearUserData());
          dispatch(clearOrganizationData());
          // Reset the root stack, not the tab navigator this screen sits in.
          navigation.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: "Welcome" }] }),
          );
        },
      },
    ]);
  };

  return (
    <Container>
      <Header title="Profile" />
      <WhiteContainer style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Identity */}
          <View style={styles.identity}>
            <Avatar name={user?.name ?? "User"} image={user?.image} size={80} />
            <Text style={styles.name}>{user?.name ?? "User"}</Text>
            <Text style={styles.email}>{user?.email ?? ""}</Text>
            <View style={styles.badges}>
              {user ? <Badge meta={getUserRoleMeta(user.role)} /> : null}
            </View>
            <Text style={styles.organization}>{organization?.name ?? ""}</Text>
          </View>

          {/* Snapshot */}
          <View style={styles.snapshot}>
            {[
              { label: "Assigned", value: stats.assigned },
              { label: "Open", value: stats.open },
              { label: "Completed", value: stats.completed },
            ].map((item, index) => (
              <React.Fragment key={item.label}>
                {index > 0 ? <View style={styles.snapshotDivider} /> : null}
                <View style={styles.snapshotItem}>
                  <Text style={styles.snapshotValue}>{item.value}</Text>
                  <Text style={styles.snapshotLabel}>{item.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>

          {/* Work */}
          <Text style={styles.sectionLabel}>Work</Text>
          <View style={styles.group}>
            <ListRow
              icon="person-outline"
              title="My Tasks"
              onPress={() => navigation.navigate("MyTasks")}
            />
            <View style={styles.rowDivider} />
            <ListRow
              icon="stats-chart-outline"
              title="My Performance"
              onPress={() => navigation.navigate("MyPerformance")}
            />
            {isApprover ? (
              <>
                <View style={styles.rowDivider} />
                <ListRow
                  icon="shield-checkmark-outline"
                  title="Pending Approvals"
                  value={approvalCount > 0 ? String(approvalCount) : undefined}
                  onPress={() => navigation.navigate("PendingApprovals")}
                />
                <View style={styles.rowDivider} />
                <ListRow
                  icon="people-outline"
                  title="My Team"
                  onPress={() => navigation.navigate("MyTeam")}
                />
              </>
            ) : null}
          </View>

          {/* Account */}
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.group}>
            <ListRow
              icon="create-outline"
              title="Edit Profile"
              onPress={() => navigation.navigate("EditProfile")}
            />
            <View style={styles.rowDivider} />
            <ListRow
              icon="lock-closed-outline"
              title="Change Password"
              onPress={() => navigation.navigate("ChangePassword")}
            />
            <View style={styles.rowDivider} />
            <ListRow
              icon="business-outline"
              title="Organization"
              subtitle={organization?.uniqueOrganizationId}
              onPress={() => navigation.navigate("OrganizationInfo")}
            />
            <View style={styles.rowDivider} />
            <ListRow
              icon="settings-outline"
              title="Settings"
              onPress={() => navigation.navigate("Settings")}
            />
          </View>

          {/* Session */}
          <View style={[styles.group, styles.signOutGroup]}>
            <ListRow
              icon="log-out-outline"
              title="Sign Out"
              destructive
              showChevron={false}
              onPress={handleSignOut}
            />
          </View>

          <Text style={styles.version}>Taskly · v0.0.1</Text>
        </ScrollView>
      </WhiteContainer>
    </Container>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  content: {
    paddingBottom: 90,
  },
  identity: {
    alignItems: "center",
    paddingVertical: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
    marginTop: 14,
  },
  email: {
    fontSize: 13,
    color: Colors.mutedFont,
    marginTop: 4,
  },
  badges: {
    marginTop: 12,
  },
  organization: {
    fontSize: 13,
    color: Colors.lightFont,
    fontWeight: "500",
    marginTop: 10,
  },
  snapshot: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    marginTop: 20,
  },
  snapshotItem: {
    flex: 1,
    alignItems: "center",
    // Padding lives here so the divider can run the full height of the card
    paddingVertical: 16,
  },
  snapshotDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: Colors.lightBorder,
  },
  snapshotValue: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
  },
  snapshotLabel: {
    fontSize: 11,
    color: Colors.mutedFont,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 3,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.mutedFont,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 28,
    marginBottom: 10,
  },
  group: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    paddingHorizontal: 14,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.leaderboardBorderVeryLight,
    marginHorizontal: -14,
  },
  signOutGroup: {
    marginTop: 28,
  },
  version: {
    fontSize: 11,
    color: Colors.mutedFont,
    textAlign: "center",
    marginTop: 24,
  },
});
