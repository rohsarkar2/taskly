import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  Container,
  Header,
  ProgressBar,
  SectionHeader,
  StatCard,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import {
  getProjectById,
  getProjectsForUser,
  getTasksAssignedTo,
} from "../data";
import { MyPerformanceScreenProps } from "../navigation/NavigationTypes";
import { useAppSelector } from "../store/hooks";
import { isOverdue } from "../utils/Formatters";

const MyPerformance: React.FC<MyPerformanceScreenProps> = () => {
  const user = useAppSelector((state) => state.user.userData);

  const metrics = useMemo(() => {
    const assigned = user ? getTasksAssignedTo(user.id) : [];
    const completed = assigned.filter((task) => task.status === "completed");
    const inProgress = assigned.filter((task) => task.status === "in-progress");
    const overdue = assigned.filter((task) =>
      isOverdue(task.dueDate, task.status)
    );
    const awaiting = assigned.filter(
      (task) => task.status === "pending-approval"
    );

    return {
      assigned: assigned.length,
      completed: completed.length,
      inProgress: inProgress.length,
      overdue: overdue.length,
      awaiting: awaiting.length,
      completionRate: assigned.length
        ? Math.round((completed.length / assigned.length) * 100)
        : 0,
      onTimeRate: completed.length
        ? Math.round(
            (completed.filter(
              (task) =>
                new Date(task.updatedAt).getTime() <=
                new Date(task.dueDate).getTime()
            ).length /
              completed.length) *
              100
          )
        : 0,
    };
  }, [user]);

  // Load per project, so it is obvious where the work sits.
  const byProject = useMemo(() => {
    if (!user) return [];

    const assigned = getTasksAssignedTo(user.id);

    return getProjectsForUser(user.id)
      .map((project) => {
        const projectTasks = assigned.filter(
          (task) => task.projectId === project.id
        );
        const done = projectTasks.filter(
          (task) => task.status === "completed"
        ).length;

        return {
          project,
          total: projectTasks.length,
          done,
          percent: projectTasks.length
            ? Math.round((done / projectTasks.length) * 100)
            : 0,
        };
      })
      .filter((entry) => entry.total > 0);
  }, [user]);

  return (
    <Container>
      <Header title="My Performance" showBack />
      <WhiteContainer style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Headline */}
          <View style={styles.headline}>
            <Text style={styles.headlineValue}>{metrics.completionRate}%</Text>
            <Text style={styles.headlineLabel}>Completion rate</Text>
            <ProgressBar
              progress={metrics.completionRate}
              height={8}
              style={styles.headlineBar}
            />
            <View style={styles.headlineFooter}>
              <View style={styles.headlineFooterItem}>
                <Ionicons
                  name="checkmark-done-outline"
                  size={14}
                  color={Colors.success}
                />
                <Text style={styles.headlineFooterText}>
                  {metrics.completed} of {metrics.assigned} completed
                </Text>
              </View>
              <View style={styles.headlineFooterItem}>
                <Ionicons
                  name="timer-outline"
                  size={14}
                  color={Colors.primary}
                />
                <Text style={styles.headlineFooterText}>
                  {metrics.onTimeRate}% on time
                </Text>
              </View>
            </View>
          </View>

          {/* Breakdown */}
          <View style={styles.statsRow}>
            <StatCard
              icon="albums-outline"
              label="Assigned"
              value={metrics.assigned}
              color={Colors.primary}
            />
            <StatCard
              icon="checkmark-circle-outline"
              label="Completed"
              value={metrics.completed}
              color={Colors.success}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              icon="play-circle-outline"
              label="In Progress"
              value={metrics.inProgress}
              color={Colors.statusInProgress}
            />
            <StatCard
              icon="alert-circle-outline"
              label="Overdue"
              value={metrics.overdue}
              color={Colors.danger}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              icon="hourglass-outline"
              label="Awaiting Approval"
              value={metrics.awaiting}
              color={Colors.warning}
            />
            <View style={styles.statsSpacer} />
          </View>

          {/* Per project */}
          <SectionHeader title="By project" style={styles.sectionHeader} />
          <View style={styles.projectCard}>
            {byProject.length > 0 ? (
              byProject.map((entry, index) => (
                <View
                  key={entry.project.id}
                  style={[styles.projectRow, index > 0 && styles.projectRowGap]}
                >
                  <View style={styles.projectHeader}>
                    <View
                      style={[
                        styles.projectDot,
                        { backgroundColor: entry.project.color },
                      ]}
                    />
                    <Text style={styles.projectName} numberOfLines={1}>
                      {entry.project.name}
                    </Text>
                    <Text style={styles.projectCount}>
                      {entry.done}/{entry.total}
                    </Text>
                  </View>
                  <ProgressBar
                    progress={entry.percent}
                    color={entry.project.color}
                  />
                </View>
              ))
            ) : (
              <Text style={styles.empty}>
                No tasks assigned to you yet this cycle.
              </Text>
            )}
          </View>
        </ScrollView>
      </WhiteContainer>
    </Container>
  );
};

export default MyPerformance;

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  content: {
    paddingBottom: 40,
  },
  headline: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    padding: 20,
    marginBottom: 16,
  },
  headlineValue: {
    fontSize: 40,
    fontWeight: "700",
    color: Colors.black,
    letterSpacing: -1.5,
  },
  headlineLabel: {
    fontSize: 13,
    color: Colors.mutedFont,
    fontWeight: "500",
    marginTop: 2,
    marginBottom: 16,
  },
  headlineBar: {
    marginBottom: 16,
  },
  headlineFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  headlineFooterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headlineFooterText: {
    fontSize: 12,
    color: Colors.lightFont,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statsSpacer: {
    flex: 1,
  },
  sectionHeader: {
    marginTop: 20,
  },
  projectCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    padding: 16,
  },
  projectRow: {
    gap: 8,
  },
  projectRowGap: {
    marginTop: 18,
  },
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  projectDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  projectName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: Colors.black,
  },
  projectCount: {
    fontSize: 12,
    color: Colors.mutedFont,
    fontWeight: "600",
  },
  empty: {
    fontSize: 13,
    color: Colors.mutedFont,
    textAlign: "center",
    paddingVertical: 12,
  },
});
