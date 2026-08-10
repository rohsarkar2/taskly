import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  AvatarStack,
  Badge,
  Container,
  EmptyState,
  Header,
  ProgressBar,
  SectionHeader,
  SegmentedTabs,
  TaskCard,
  WhiteContainer,
} from "../components";
import type { TabItem } from "../components";
import Colors from "../configs/Colors";
import {
  getProjectById,
  getProjectMembers,
  getTasksByProjectId,
} from "../data";
import { TaskModel, TaskStatus } from "../models/task";
import { ProjectDetailsScreenProps } from "../navigation/NavigationTypes";
import { useAppSelector } from "../store/hooks";
import {
  formatDate,
  getProjectStatusMeta,
  getUserRoleMeta,
} from "../utils/Formatters";

type TaskTab = "all" | TaskStatus;

const ProjectDetails: React.FC<ProjectDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { projectId } = route.params;
  const user = useAppSelector((state) => state.user.userData);
  const [activeTab, setActiveTab] = useState<TaskTab>("all");

  const project = getProjectById(projectId);
  const members = useMemo(() => getProjectMembers(projectId), [projectId]);
  const projectTasks = useMemo(
    () => getTasksByProjectId(projectId),
    [projectId]
  );

  const leads = members.filter((member) => member.role === "team-lead");
  const managers = members.filter((member) => member.role === "manager");

  const canManage = user?.role === "team-lead" || user?.role === "manager";

  const tabs: TabItem<TaskTab>[] = [
    { key: "all", label: "All", count: projectTasks.length },
    {
      key: "to-do",
      label: "To Do",
      count: projectTasks.filter((task) => task.status === "to-do").length,
    },
    {
      key: "in-progress",
      label: "In Progress",
      count: projectTasks.filter((task) => task.status === "in-progress")
        .length,
    },
    {
      key: "pending-approval",
      label: "Approval",
      count: projectTasks.filter((task) => task.status === "pending-approval")
        .length,
    },
    {
      key: "completed",
      label: "Completed",
      count: projectTasks.filter((task) => task.status === "completed").length,
    },
  ];

  const visibleTasks =
    activeTab === "all"
      ? projectTasks
      : projectTasks.filter((task) => task.status === activeTab);

  const gotoTaskDetails = (task: TaskModel) =>
    navigation.navigate("TaskDetails", { taskId: task.id });

  if (!project) {
    return (
      <Container>
        <Header title="Project" showBack />
        <WhiteContainer>
          <EmptyState
            icon="alert-circle-outline"
            title="Project not found"
            subtitle="This project may have been removed or you no longer have access."
          />
        </WhiteContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header
        title={project.name}
        showBack
        right={
          canManage ? (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("CreateTask", { projectId: project.id })
              }
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Add task"
            >
              <Ionicons name="add" size={26} color={Colors.primary} />
            </TouchableOpacity>
          ) : null
        }
      />
      <WhiteContainer style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Overview */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: `${project.color}1A` },
                ]}
              >
                <Ionicons name="folder-open" size={22} color={project.color} />
              </View>
              <View style={styles.overviewTitle}>
                <Text style={styles.name}>{project.name}</Text>
                <Text style={styles.due}>
                  Due {formatDate(project.dueDate)}
                </Text>
              </View>
              <Badge meta={getProjectStatusMeta(project.status)} size="small" />
            </View>

            <View style={styles.progressRow}>
              <Text style={styles.progressValue}>{project.progress}%</Text>
              <Text style={styles.progressLabel}>Complete</Text>
            </View>
            <ProgressBar
              progress={project.progress}
              color={project.color}
              height={8}
            />

            <Text style={styles.description}>{project.description}</Text>

            <View style={styles.countsRow}>
              {[
                { label: "To Do", value: project.taskCounts.toDo },
                { label: "Active", value: project.taskCounts.inProgress },
                {
                  label: "Approval",
                  value: project.taskCounts.pendingApproval,
                },
                { label: "Done", value: project.taskCounts.completed },
              ].map((count) => (
                <View key={count.label} style={styles.countItem}>
                  <Text style={styles.countValue}>{count.value}</Text>
                  <Text style={styles.countLabel}>{count.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Members */}
          <TouchableOpacity
            style={styles.membersCard}
            onPress={() =>
              navigation.navigate("ProjectMembers", { projectId: project.id })
            }
            activeOpacity={0.7}
          >
            <AvatarStack people={members} size={30} max={5} />
            <View style={styles.membersText}>
              <Text style={styles.membersTitle}>
                {members.length} member{members.length === 1 ? "" : "s"}
              </Text>
              <Text style={styles.membersSubtitle}>
                {managers.length} manager{managers.length === 1 ? "" : "s"} ·{" "}
                {leads.length} lead{leads.length === 1 ? "" : "s"}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.mutedFont}
            />
          </TouchableOpacity>

          {/* Approval workflow */}
          <View style={styles.workflowCard}>
            <View style={styles.workflowHeader}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={Colors.primary}
              />
              <Text style={styles.workflowTitle}>Approval workflow</Text>
            </View>
            <Text style={styles.workflowBody}>
              Tasks in this project can be approved by:
            </Text>
            <View style={styles.workflowRoles}>
              {project.approverRoles.map((role) => (
                <Badge key={role} meta={getUserRoleMeta(role)} size="small" />
              ))}
            </View>
          </View>

          {/* Tasks */}
          <SectionHeader title="Tasks" style={styles.tasksHeader} />
          <SegmentedTabs
            tabs={tabs}
            activeKey={activeTab}
            onChange={setActiveTab}
            scrollable
            style={styles.tabs}
          />

          <View style={styles.taskList}>
            {visibleTasks.length > 0 ? (
              visibleTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onPress={gotoTaskDetails}
                  showProject={false}
                />
              ))
            ) : (
              <EmptyState
                icon="checkbox-outline"
                title="No tasks here"
                subtitle="Nothing in this list right now."
              />
            )}
          </View>
        </ScrollView>
      </WhiteContainer>
    </Container>
  );
};

export default ProjectDetails;

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  content: {
    paddingBottom: 40,
  },
  overviewCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    padding: 16,
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  overviewTitle: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.black,
  },
  due: {
    fontSize: 12,
    color: Colors.mutedFont,
    marginTop: 3,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 18,
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.black,
    letterSpacing: -0.6,
  },
  progressLabel: {
    fontSize: 13,
    color: Colors.mutedFont,
    fontWeight: "500",
  },
  description: {
    fontSize: 14,
    color: Colors.lightFont,
    lineHeight: 21,
    marginTop: 16,
  },
  countsRow: {
    flexDirection: "row",
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.leaderboardBorderVeryLight,
  },
  countItem: {
    flex: 1,
    alignItems: "center",
  },
  countValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
  },
  countLabel: {
    fontSize: 11,
    color: Colors.mutedFont,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  membersCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    padding: 14,
    marginTop: 12,
    gap: 12,
  },
  membersText: {
    flex: 1,
  },
  membersTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
  },
  membersSubtitle: {
    fontSize: 12,
    color: Colors.mutedFont,
    marginTop: 2,
  },
  workflowCard: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
  },
  workflowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  workflowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  workflowBody: {
    fontSize: 13,
    color: Colors.secondaryFont,
    marginTop: 8,
  },
  workflowRoles: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  tasksHeader: {
    marginTop: 28,
  },
  tabs: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  taskList: {
    marginTop: 16,
  },
});
