import React, { useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  Avatar,
  Container,
  Header,
  SectionHeader,
  StatCard,
  TaskCard,
  TimelineItem,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import {
  getPendingApprovalsFor,
  getTasksAssignedTo,
  organization,
  recentActivity,
} from "../data";
import { TaskModel } from "../models/task";
import { HomeScreenProps } from "../navigation/NavigationTypes";
import { useAppSelector } from "../store/hooks";
import { daysUntil, greetingForNow, isOverdue } from "../utils/Formatters";

const Home: React.FC<HomeScreenProps> = ({ navigation }) => {
  const user = useAppSelector((state) => state.user.userData);
  const [refreshing, setRefreshing] = React.useState(false);

  const {
    myTasks,
    todayTasks,
    inProgressTasks,
    pendingApprovalTasks,
    completedTasks,
    overdueTasks,
    upcomingTasks,
    approvalQueue,
  } = useMemo(() => {
    const assigned = user ? getTasksAssignedTo(user.id) : [];
    const open = assigned.filter((task) => task.status !== "completed");

    return {
      myTasks: assigned,
      todayTasks: open.filter((task) => daysUntil(task.dueDate) === 0),
      inProgressTasks: assigned.filter((task) => task.status === "in-progress"),
      pendingApprovalTasks: assigned.filter(
        (task) => task.status === "pending-approval"
      ),
      completedTasks: assigned.filter((task) => task.status === "completed"),
      overdueTasks: open.filter((task) => isOverdue(task.dueDate, task.status)),
      upcomingTasks: open
        .filter((task) => daysUntil(task.dueDate) > 0)
        .sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        ),
      approvalQueue: user ? getPendingApprovalsFor(user) : [],
    };
  }, [user]);

  const isApprover = user?.role === "team-lead" || user?.role === "manager";

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  const gotoTaskDetails = (task: TaskModel) =>
    navigation.navigate("TaskDetails", { taskId: task.id });

  const renderGreeting = () => (
    <View style={styles.greetingRow}>
      <View style={styles.greetingText}>
        <Text style={styles.greeting}>
          {greetingForNow()}, {user?.name?.split(" ")[0] ?? "there"} 👋
        </Text>
        <Text style={styles.organization}>{organization.name}</Text>
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

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatCard
              icon="today-outline"
              label="Today"
              value={todayTasks.length}
              color={Colors.primary}
              onPress={() => navigation.navigate("MyTasks")}
            />
            <StatCard
              icon="play-circle-outline"
              label="In Progress"
              value={inProgressTasks.length}
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
              value={pendingApprovalTasks.length}
              color={Colors.statusPendingApproval}
              onPress={() =>
                navigation.navigate("Tasks", { filter: "pending-approval" })
              }
            />
            <StatCard
              icon="checkmark-circle-outline"
              label="Completed"
              value={completedTasks.length}
              color={Colors.success}
              onPress={() =>
                navigation.navigate("Tasks", { filter: "completed" })
              }
            />
          </View>

          {/* Approver call to action */}
          {isApprover && approvalQueue.length > 0 ? (
            <TouchableOpacity
              style={styles.approvalBanner}
              onPress={() => navigation.navigate("PendingApprovals")}
              activeOpacity={0.8}
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
                  {approvalQueue.length} task
                  {approvalQueue.length === 1 ? "" : "s"} waiting on you
                </Text>
                <Text style={styles.approvalSubtitle}>
                  Review and approve pending work
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.white} />
            </TouchableOpacity>
          ) : null}

          {/* Overdue */}
          {overdueTasks.length > 0 ? (
            <View style={styles.section}>
              <SectionHeader
                title={`Overdue (${overdueTasks.length})`}
                actionTitle="See all"
                onActionPress={() => navigation.navigate("MyTasks")}
              />
              {overdueTasks.slice(0, 2).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onPress={gotoTaskDetails}
                  showAssignee={false}
                />
              ))}
            </View>
          ) : null}

          {/* Quick actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.primaryAction}
              onPress={() => navigation.navigate("CreateTask")}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={20} color={Colors.white} />
              <Text style={styles.primaryActionText}>New Task</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => navigation.navigate("MyTasks")}
              activeOpacity={0.85}
            >
              <Ionicons
                name="person-outline"
                size={18}
                color={Colors.primary}
              />
              <Text style={styles.secondaryActionText}>My Tasks</Text>
            </TouchableOpacity>
          </View>

          {/* My tasks */}
          <View style={styles.section}>
            <SectionHeader
              title="My Tasks"
              actionTitle="See all"
              onActionPress={() =>
                navigation.navigate("Tasks", { filter: "my-tasks" })
              }
            />
            {myTasks.filter((task) => task.status !== "completed").length >
            0 ? (
              myTasks
                .filter((task) => task.status !== "completed")
                .slice(0, 3)
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onPress={gotoTaskDetails}
                    showAssignee={false}
                  />
                ))
            ) : (
              <Text style={styles.empty}>
                Nothing assigned to you right now
              </Text>
            )}
          </View>

          {/* Upcoming */}
          <View style={styles.section}>
            <SectionHeader title="Upcoming" />
            {upcomingTasks.length > 0 ? (
              upcomingTasks
                .slice(0, 3)
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onPress={gotoTaskDetails}
                    showAssignee={false}
                  />
                ))
            ) : (
              <Text style={styles.empty}>No upcoming deadlines</Text>
            )}
          </View>

          {/* Recent activity */}
          <View style={styles.section}>
            <SectionHeader title="Recent Activity" />
            <View style={styles.activityCard}>
              {recentActivity.slice(0, 5).map((item, index, list) => (
                <TimelineItem
                  key={item.id}
                  item={item}
                  isLast={index === list.length - 1}
                  showDate
                />
              ))}
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
  approvalBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    gap: 12,
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
    marginTop: 20,
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
    marginBottom: 28,
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
