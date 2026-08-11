import React, { useCallback, useEffect, useState } from "react";
import {
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
  AvatarStack,
  Badge,
  Container,
  EmptyState,
  Header,
  Loader,
  ProgressBar,
  SectionHeader,
  SegmentedTabs,
  TaskCard,
  TimelineItem,
  WhiteContainer,
} from "../components";
import type { TabItem } from "../components";
import Colors from "../configs/Colors";
import { ProjectDetailsModel, ProjectMemberModel } from "../models/project";
import { ActivityModel, TaskModel, TaskStatus } from "../models/task";
import { ProjectDetailsScreenProps } from "../navigation/NavigationTypes";
import ProjectService from "../services/ProjectService";
import TaskService from "../services/TaskService";
import {
  formatDate,
  getAvatarColor,
  getProjectStatusMeta,
  getTaskPriorityMeta,
  getUserRoleMeta,
} from "../utils/Formatters";
import {
  mapApiActivity,
  mapApiProjectDetails,
  mapApiProjectMember,
  mapApiTask,
} from "../utils/Mappers";

type TaskTab = "all" | TaskStatus;

/** The tab keys are the app's; the API's task filter wants its own spelling. */
const API_TASK_STATUS: Record<Exclude<TaskTab, "all">, string> = {
  "to-do": "pending",
  "in-progress": "in_progress",
  "pending-approval": "pending_approval",
  completed: "completed",
  rejected: "rejected",
  blocked: "blocked",
};

const ProjectDetails: React.FC<ProjectDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { projectId } = route.params;
  const [activeTab, setActiveTab] = useState<TaskTab>("all");

  const [details, setDetails] = useState<ProjectDetailsModel | null>(null);
  const [members, setMembers] = useState<ProjectMemberModel[]>([]);
  const [timeline, setTimeline] = useState<ActivityModel[]>([]);
  const [projectTasks, setProjectTasks] = useState<TaskModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        try {
          const [detailsResponse, membersResponse, timelineResponse] =
            await Promise.all([
              ProjectService.getProjectDetails(projectId),
              ProjectService.getProjectMembers(projectId),
              ProjectService.getProjectTimeline(projectId),
            ]);
          if (!active) return;

          setDetails(mapApiProjectDetails(detailsResponse?.data));
          setMembers(
            (membersResponse?.data?.members ?? []).map(mapApiProjectMember),
          );
          setTimeline(
            (timelineResponse?.data?.events ?? []).map(mapApiActivity),
          );
        } catch (caught: any) {
          if (active) {
            setError(caught?.message ?? "Couldn't load this project.");
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      })();

      return () => {
        active = false;
      };
    }, [projectId]),
  );

  // The task list is filtered server side, so it reloads when the tab changes.
  useEffect(() => {
    let active = true;
    setTasksLoading(true);

    (async () => {
      try {
        const response = await TaskService.taskList({
          projectId,
          status: activeTab === "all" ? undefined : API_TASK_STATUS[activeTab],
          sortBy: "dueDate",
          sortOrder: "asc",
        });
        if (active) {
          setProjectTasks((response?.data?.tasks ?? []).map(mapApiTask));
        }
      } catch {
        if (active) {
          setProjectTasks([]);
        }
      } finally {
        if (active) {
          setTasksLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [projectId, activeTab]);

  const project = details?.project;
  const workflow = details?.workflow;
  const byStatus = details?.taskStats.byStatus ?? {};

  const leads = members.filter((member) => member.role === "team-lead");
  const managers = members.filter((member) => member.role === "manager");

  // The workflow sends approvers as bare ids with no name or role, so they are
  // resolved against the project roster, which carries both. An id that matches
  // nobody on it stays nameless and is left out rather than shown blank.
  const namedApprovers = (workflow?.approvers ?? [])
    .map((approver) => {
      const member = members.find((person) => person.id === approver.id);

      return {
        id: approver.id,
        name: approver.name || member?.name || "",
        role: approver.role ?? member?.role ?? null,
      };
    })
    .filter((approver) => approver.name);

  // Only project managers and leads can add work to someone else's project.
  const canManage =
    project?.projectRole === "manager" || project?.projectRole === "team-lead";

  const tabs: TabItem<TaskTab>[] = [
    { key: "all", label: "All", count: details?.taskStats.total },
    { key: "to-do", label: "To Do", count: byStatus.pending },
    { key: "in-progress", label: "In Progress", count: byStatus.in_progress },
    {
      key: "pending-approval",
      label: "Approval",
      count: byStatus.pending_approval,
    },
    { key: "completed", label: "Completed", count: byStatus.completed },
  ];

  const gotoTaskDetails = (task: TaskModel) =>
    navigation.navigate("TaskDetails", { taskId: task.id });

  if (loading) {
    return (
      <Container>
        <Header title="Project" showBack />
        <WhiteContainer>
          <Loader style={styles.screenLoader} size="large" />
        </WhiteContainer>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container>
        <Header title="Project" showBack />
        <WhiteContainer>
          <EmptyState
            icon="alert-circle-outline"
            title={error ? "Couldn't load project" : "Project not found"}
            subtitle={
              error ??
              "This project may have been removed or you no longer have access."
            }
          />
        </WhiteContainer>
      </Container>
    );
  }

  const projectColor = getAvatarColor(project.id);
  const progress = Math.round(details?.taskStats.completionPercentage ?? 0);

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
                  { backgroundColor: `${projectColor}1A` },
                ]}
              >
                <Ionicons name="folder-open" size={22} color={projectColor} />
              </View>
              <View style={styles.overviewTitle}>
                <Text style={styles.name}>{project.name}</Text>
                {project.endDate ? (
                  <Text style={styles.due}>
                    Due {formatDate(project.endDate)}
                  </Text>
                ) : null}
              </View>
              <Badge meta={getProjectStatusMeta(project.status)} size="small" />
            </View>

            <View style={styles.progressRow}>
              <Text style={styles.progressValue}>{progress}%</Text>
              <Text style={styles.progressLabel}>Complete</Text>
            </View>
            <ProgressBar progress={progress} color={projectColor} height={8} />

            <Text style={styles.description}>
              {project.code ? `${project.code} · ` : ""}
              {project.taskStats.mine} task
              {project.taskStats.mine === 1 ? "" : "s"} assigned to you
            </Text>

            <View style={styles.countsRow}>
              {[
                { label: "To Do", value: byStatus.pending ?? 0 },
                { label: "Active", value: byStatus.in_progress ?? 0 },
                {
                  label: "Approval",
                  value: byStatus.pending_approval ?? 0,
                },
                { label: "Done", value: byStatus.completed ?? 0 },
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
            <AvatarStack
              people={members.map((member) => ({
                id: member.id,
                name: member.name,
                image: member.avatar,
              }))}
              size={30}
              max={5}
            />
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
                name={
                  workflow?.requireTaskApproval
                    ? "shield-checkmark"
                    : "flash-outline"
                }
                size={18}
                color={Colors.primary}
              />
              <Text style={styles.workflowTitle}>
                {workflow?.requireTaskApproval
                  ? "Approval required"
                  : "No approval needed"}
              </Text>
            </View>

            <Text style={styles.workflowBody}>
              {workflow?.requireTaskApproval
                ? "Marking a task complete sends it for review first."
                : "Marking a task complete closes it straight away."}
            </Text>

            {workflow?.requireTaskApproval ? (
              <>
                <Text style={styles.workflowLabel}>Reviewed by</Text>

                {namedApprovers.length > 0 ? (
                  // Explicit approvers win over the role rule, so they are the
                  // only thing shown when the project names them.
                  namedApprovers.map((approver) => (
                    <View key={approver.id} style={styles.approverRow}>
                      <Avatar name={approver.name} size={28} />
                      <Text style={styles.approverName} numberOfLines={1}>
                        {approver.name}
                      </Text>
                      {approver.role ? (
                        <Text style={styles.approverRole}>
                          {getUserRoleMeta(approver.role).label}
                        </Text>
                      ) : null}
                    </View>
                  ))
                ) : (
                  <View style={styles.approverRow}>
                    <View style={styles.approverGroupIcon}>
                      <Ionicons
                        name="people"
                        size={15}
                        color={Colors.primary}
                      />
                    </View>
                    <Text style={styles.approverName}>
                      {workflow.approverRole
                        ? `Any ${getUserRoleMeta(
                            workflow.approverRole,
                          ).label.toLowerCase()} on this project`
                        : "Any manager in the organization"}
                    </Text>
                  </View>
                )}
              </>
            ) : null}

            {/* What the workflow lets ordinary members do. */}
            <View style={styles.workflowDivider} />
            <View style={styles.permissionRow}>
              <Ionicons
                name={
                  workflow?.allowMemberTaskCreation
                    ? "checkmark-circle"
                    : "close-circle"
                }
                size={16}
                color={
                  workflow?.allowMemberTaskCreation
                    ? Colors.success
                    : Colors.mutedFont
                }
              />
              <Text style={styles.permissionText}>
                Members {workflow?.allowMemberTaskCreation ? "can" : "can't"}{" "}
                create tasks
              </Text>
            </View>
            <View style={styles.permissionRow}>
              <Ionicons
                name={
                  workflow?.allowMemberTaskDeletion
                    ? "checkmark-circle"
                    : "close-circle"
                }
                size={16}
                color={
                  workflow?.allowMemberTaskDeletion
                    ? Colors.success
                    : Colors.mutedFont
                }
              />
              <Text style={styles.permissionText}>
                Members {workflow?.allowMemberTaskDeletion ? "can" : "can't"}{" "}
                delete their own tasks
              </Text>
            </View>
            {workflow ? (
              <View style={styles.permissionRow}>
                <Ionicons
                  name="flag"
                  size={15}
                  color={getTaskPriorityMeta(workflow.defaultPriority).color}
                />
                <Text style={styles.permissionText}>
                  New tasks default to{" "}
                  {getTaskPriorityMeta(
                    workflow.defaultPriority,
                  ).label.toLowerCase()}{" "}
                  priority
                </Text>
              </View>
            ) : null}
          </View>

          {/* Timeline */}
          {timeline.length > 0 ? (
            <>
              <SectionHeader
                title="Recent Activity"
                style={styles.tasksHeader}
              />
              <View style={styles.timelineCard}>
                {timeline.slice(0, 5).map((item, index, list) => (
                  <TimelineItem
                    key={item.id}
                    item={item}
                    isLast={index === list.length - 1}
                    showDate
                  />
                ))}
              </View>
            </>
          ) : null}

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
            {tasksLoading ? (
              <Loader style={styles.tasksLoader} />
            ) : projectTasks.length > 0 ? (
              projectTasks.map((task) => (
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
  screenLoader: {
    flex: 1,
  },
  tasksLoader: {
    paddingVertical: 32,
  },
  workflowLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.mutedFont,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 8,
  },
  approverRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  approverGroupIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  approverName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: Colors.black,
  },
  approverRole: {
    fontSize: 11,
    color: Colors.mutedFont,
    fontWeight: "600",
  },
  workflowDivider: {
    height: 1,
    backgroundColor: Colors.lightBorder,
    marginTop: 8,
    marginBottom: 12,
  },
  permissionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  permissionText: {
    flex: 1,
    fontSize: 12.5,
    color: Colors.secondaryFont,
  },
  timelineCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    padding: 16,
  },
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
