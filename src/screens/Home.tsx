import React, { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  Avatar,
  Container,
  Header,
  Loader,
  SectionHeader,
  StatCard,
  TaskCard,
  TimelineItem,
  WhiteContainer,
} from "../components";
import type { TaskCardTask } from "../components/TaskCard";
import Colors from "../configs/Colors";
import { DashboardSummaryModel, DashboardTaskModel } from "../models/dashboard";
import { ActivityModel } from "../models/task";
import { HomeScreenProps } from "../navigation/NavigationTypes";
import DashboardService from "../services/DashboardService";
import { useAppSelector } from "../store/hooks";
import { greetingForNow } from "../utils/Formatters";
import { mapDashboard, mapDashboardTask } from "../utils/Mappers";

const Home: React.FC<HomeScreenProps> = ({ navigation }) => {
  const user = useAppSelector((state) => state.user.userData);
  const organization = useAppSelector(
    (state) => state.organization.organizationData,
  );

  const [summary, setSummary] = useState<DashboardSummaryModel | null>(null);
  const [todaysTasks, setTodaysTasks] = useState<DashboardTaskModel[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<DashboardTaskModel[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setError(null);

      const [dashboardResponse, upcomingResponse] = await Promise.all([
        DashboardService.getDashboard(),
        DashboardService.getUpcomingTasks(),
      ]);

      const dashboard = mapDashboard(dashboardResponse?.data);
      setSummary(dashboard.summary);
      setTodaysTasks(dashboard.todaysTasks);
      setRecentActivity(dashboard.recentActivity);
      setUpcomingTasks(
        (upcomingResponse?.data?.tasks ?? []).map(mapDashboardTask),
      );
    } catch (caught: any) {
      setError(caught?.message ?? "Couldn't load your dashboard.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        await loadDashboard();
        if (active) {
          setLoading(false);
        }
      })();

      return () => {
        active = false;
      };
    }, [loadDashboard]),
  );

  const isApprover = user?.role === "team-lead" || user?.role === "manager";
  const awaitingMyApproval = summary?.awaitingMyApproval ?? 0;
  const overdueCount = summary?.overdueTasks ?? 0;

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const gotoTaskDetails = (task: TaskCardTask) =>
    navigation.navigate("TaskDetails", { taskId: task.id });

  const renderTask = (task: DashboardTaskModel) => (
    <TaskCard
      key={task.id}
      task={task}
      onPress={gotoTaskDetails}
      showAssignee={false}
    />
  );

  const renderGreeting = () => (
    <View style={styles.greetingRow}>
      <View style={styles.greetingText}>
        <Text style={styles.greeting}>
          {greetingForNow()}, {user?.name?.split(" ")[0] ?? "there"} 👋
        </Text>
        <Text style={styles.organization}>{organization?.name ?? ""}</Text>
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate("Profile")}
        activeOpacity={0.7}
      >
        <Avatar name={user?.name ?? "User"} image={user?.image} size={42} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Container>
      <Header title="Taskly" showLogo />
      <WhiteContainer style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        >
          {renderGreeting()}

          {error ? (
            <TouchableOpacity
              style={styles.errorBanner}
              onPress={handleRefresh}
              activeOpacity={0.7}
            >
              <Ionicons
                name="cloud-offline-outline"
                size={18}
                color={Colors.danger}
              />
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.errorRetry}>Retry</Text>
            </TouchableOpacity>
          ) : null}

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatCard
              icon="today-outline"
              label="Today"
              value={todaysTasks.length}
              color={Colors.primary}
              onPress={() => navigation.navigate("MyTasks")}
            />
            <StatCard
              icon="play-circle-outline"
              label="In Progress"
              value={summary?.inProgressTasks ?? 0}
              color={Colors.statusInProgress}
              onPress={() =>
                navigation.navigate("Tasks", { filter: "in-progress" })
              }
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              icon="hourglass-outline"
              label="Awaiting"
              value={summary?.pendingApprovals ?? 0}
              color={Colors.statusPendingApproval}
              onPress={() =>
                navigation.navigate("Tasks", { filter: "pending-approval" })
              }
            />
            <StatCard
              icon="checkmark-circle-outline"
              label="Completed"
              value={summary?.completedTasks ?? 0}
              color={Colors.success}
              onPress={() =>
                navigation.navigate("Tasks", { filter: "completed" })
              }
            />
          </View>

          {/* Approver call to action */}
          {isApprover && awaitingMyApproval > 0 ? (
            <TouchableOpacity
              style={styles.approvalBanner}
              onPress={() => navigation.navigate("PendingApprovals")}
              activeOpacity={0.7}
            >
              <View style={styles.approvalIcon}>
                <Ionicons
                  name="shield-checkmark"
                  size={20}
                  color={Colors.white}
                />
              </View>
              <View style={styles.approvalText}>
                <Text style={styles.approvalTitle}>
                  {awaitingMyApproval} task
                  {awaitingMyApproval === 1 ? "" : "s"} waiting on you
                </Text>
                <Text style={styles.approvalSubtitle}>
                  Review and approve pending work
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.white} />
            </TouchableOpacity>
          ) : null}

          {/* Overdue — the dashboard sends the count, not the tasks */}
          {overdueCount > 0 ? (
            <TouchableOpacity
              style={styles.overdueBanner}
              onPress={() => navigation.navigate("MyTasks")}
              activeOpacity={0.7}
            >
              <Ionicons name="alert-circle" size={20} color={Colors.danger} />
              <Text style={styles.overdueText}>
                {overdueCount} overdue task{overdueCount === 1 ? "" : "s"}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.danger}
              />
            </TouchableOpacity>
          ) : null}

          {/* Quick actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.primaryAction}
              onPress={() => navigation.navigate("CreateTask")}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color={Colors.white} />
              <Text style={styles.primaryActionText}>New Task</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => navigation.navigate("MyTasks")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="person-outline"
                size={18}
                color={Colors.primary}
              />
              <Text style={styles.secondaryActionText}>My Tasks</Text>
            </TouchableOpacity>
          </View>

          {/* Due today */}
          <View style={styles.section}>
            <SectionHeader
              title="Due Today"
              actionTitle="See all"
              onActionPress={() =>
                navigation.navigate("Tasks", { filter: "my-tasks" })
              }
            />
            {loading ? (
              <Loader style={styles.sectionLoader} />
            ) : todaysTasks.length > 0 ? (
              todaysTasks.slice(0, 3).map(renderTask)
            ) : (
              <Text style={styles.empty}>Nothing due today</Text>
            )}
          </View>

          {/* Upcoming */}
          <View style={styles.section}>
            <SectionHeader title="Upcoming" />
            {loading ? (
              <Loader style={styles.sectionLoader} />
            ) : upcomingTasks.length > 0 ? (
              upcomingTasks.slice(0, 3).map(renderTask)
            ) : (
              <Text style={styles.empty}>No upcoming deadlines</Text>
            )}
          </View>

          {/* Recent activity */}
          <View style={styles.section}>
            <SectionHeader title="Recent Activity" />
            <View style={styles.activityCard}>
              {loading ? (
                <Loader />
              ) : recentActivity.length > 0 ? (
                recentActivity
                  .slice(0, 5)
                  .map((item, index, list) => (
                    <TimelineItem
                      key={item.id}
                      item={item}
                      isLast={index === list.length - 1}
                      showDate
                    />
                  ))
              ) : (
                <Text style={styles.empty}>No activity yet</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </WhiteContainer>
    </Container>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    paddingHorizontal: 16,
  },
  content: {
    paddingTop: 16,
    paddingBottom: 90,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  greetingText: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
    letterSpacing: -0.3,
  },
  organization: {
    fontSize: 13,
    color: Colors.mutedFont,
    marginTop: 3,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.dangerSoft,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: Colors.danger,
  },
  errorRetry: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.danger,
  },
  overdueBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.dangerSoft,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginTop: 8,
    marginBottom: 20,
  },
  overdueText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.danger,
  },
  sectionLoader: {
    paddingVertical: 24,
  },
  approvalBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    gap: 12,
    marginBottom: 20,
  },
  approvalIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  approvalText: {
    flex: 1,
  },
  approvalTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.white,
  },
  approvalSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  primaryAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.white,
  },
  secondaryAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  secondaryActionText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primary,
  },
  section: {
    marginBottom: 20,
  },
  empty: {
    fontSize: 14,
    color: Colors.mutedFont,
    textAlign: "center",
    paddingVertical: 20,
  },
  activityCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    padding: 16,
  },
});
