import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  Avatar,
  Badge,
  Button,
  CommentItem,
  Container,
  EmptyState,
  Header,
  RenderHtml,
  SectionHeader,
  TimelineItem,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import {
  getActivityByTaskId,
  getCommentsByTaskId,
  getProjectById,
  getTaskById,
  getUserById,
} from "../data";
import { TaskStatus } from "../models/task";
import { TaskDetailsScreenProps } from "../navigation/NavigationTypes";
import { useAppSelector } from "../store/hooks";
import {
  formatDate,
  formatDateTime,
  formatDueDate,
  getTaskPriorityMeta,
  getTaskStatusIcon,
  getTaskStatusMeta,
  isOverdue,
} from "../utils/Formatters";

const TaskDetails: React.FC<TaskDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { taskId } = route.params;
  const user = useAppSelector((state) => state.user.userData);

  const task = getTaskById(taskId);
  // Local status only — the backend owns the real transition.
  const [status, setStatus] = useState<TaskStatus | undefined>(task?.status);

  const comments = useMemo(() => getCommentsByTaskId(taskId), [taskId]);
  const activity = useMemo(() => getActivityByTaskId(taskId), [taskId]);

  if (!task) {
    return (
      <Container>
        <Header title="Task" showBack />
        <WhiteContainer>
          <EmptyState
            icon="alert-circle-outline"
            title="Task not found"
            subtitle="This task may have been deleted or moved."
          />
        </WhiteContainer>
      </Container>
    );
  }

  const project = getProjectById(task.projectId);
  const assignee = getUserById(task.assigneeId);
  const creator = getUserById(task.creatorId);
  const approver = getUserById(task.approverId);
  const currentStatus = status ?? task.status;
  const statusMeta = getTaskStatusMeta(currentStatus);
  const overdue = isOverdue(task.dueDate, currentStatus);

  const isAssignee = task.assigneeId === user?.id;
  const isCreator = task.creatorId === user?.id;
  const canApprove =
    (user?.role === "team-lead" || user?.role === "manager") &&
    !isCreator &&
    currentStatus === "pending-approval" &&
    (!task.approverId || task.approverId === user?.id);

  const applyStatus = (next: TaskStatus, message: string) => {
    setStatus(next);
    Alert.alert("Status updated", message);
  };

  const renderPersonRow = (
    label: string,
    name?: string,
    subtitle?: string,
    fallback?: string
  ) => (
    <View style={styles.personRow}>
      <Text style={styles.personLabel}>{label}</Text>
      {name ? (
        <View style={styles.personValue}>
          <Avatar name={name} size={30} />
          <View style={styles.personText}>
            <Text style={styles.personName}>{name}</Text>
            {subtitle ? (
              <Text style={styles.personSubtitle}>{subtitle}</Text>
            ) : null}
          </View>
        </View>
      ) : (
        <Text style={styles.personFallback}>{fallback ?? "Unassigned"}</Text>
      )}
    </View>
  );

  const renderActions = () => {
    const actions: React.ReactNode[] = [];

    if (isAssignee && currentStatus === "to-do") {
      actions.push(
        <Button
          key="start"
          title="Start Task"
          onPress={() =>
            applyStatus("in-progress", "This task is now in progress.")
          }
        />
      );
    }

    if (isAssignee && currentStatus === "in-progress") {
      actions.push(
        <Button
          key="submit"
          title="Submit for Approval"
          onPress={() =>
            applyStatus("pending-approval", "Sent to the approver for review.")
          }
        />,
        <Button
          key="block"
          title="Mark as Blocked"
          variant="secondary"
          onPress={() =>
            applyStatus("blocked", "This task is marked as blocked.")
          }
        />
      );
    }

    if (isAssignee && currentStatus === "blocked") {
      actions.push(
        <Button
          key="unblock"
          title="Resume Task"
          onPress={() =>
            applyStatus("in-progress", "This task is back in progress.")
          }
        />
      );
    }

    if (isAssignee && currentStatus === "rejected") {
      actions.push(
        <Button
          key="rework"
          title="Resume Work"
          onPress={() =>
            applyStatus("in-progress", "This task is back in progress.")
          }
        />
      );
    }

    if (canApprove) {
      actions.push(
        <Button
          key="review"
          title="Review Approval"
          onPress={() =>
            navigation.navigate("ApprovalDetails", { taskId: task.id })
          }
        />
      );
    }

    if (isCreator || isAssignee) {
      actions.push(
        <Button
          key="edit"
          title="Edit Task"
          variant="secondary"
          onPress={() => navigation.navigate("CreateTask", { taskId: task.id })}
        />
      );
    }

    if (actions.length === 0) {
      return null;
    }

    return <View style={styles.actions}>{actions}</View>;
  };

  return (
    <Container>
      <Header
        title="Task Details"
        showBack
        right={
          <TouchableOpacity
            onPress={() =>
              Alert.alert("More", "Share, duplicate and delete land here.")
            }
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={22}
              color={Colors.black}
            />
          </TouchableOpacity>
        }
      />
      <WhiteContainer style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Heading */}
          <Text style={styles.title}>{task.title}</Text>

          {project ? (
            <TouchableOpacity
              style={styles.projectRow}
              onPress={() =>
                navigation.navigate("ProjectDetails", {
                  projectId: project.id,
                })
              }
              activeOpacity={0.7}
            >
              <View
                style={[styles.projectDot, { backgroundColor: project.color }]}
              />
              <Text style={styles.projectName}>{project.name}</Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={Colors.mutedFont}
              />
            </TouchableOpacity>
          ) : null}

          <View style={styles.badgeRow}>
            <Badge meta={statusMeta} icon={getTaskStatusIcon(currentStatus)} />
            <Badge meta={getTaskPriorityMeta(task.priority)} icon="flag" />
          </View>

          {/* Rejection banner */}
          {currentStatus === "rejected" && task.rejectionReason ? (
            <View style={styles.rejectionBanner}>
              <Ionicons name="alert-circle" size={18} color={Colors.danger} />
              <View style={styles.rejectionText}>
                <Text style={styles.rejectionTitle}>Returned for changes</Text>
                <Text style={styles.rejectionBody}>{task.rejectionReason}</Text>
              </View>
            </View>
          ) : null}

          {/* Key facts */}
          <View style={styles.factsCard}>
            <View style={styles.factRow}>
              <Ionicons
                name="calendar-outline"
                size={17}
                color={overdue ? Colors.danger : Colors.lightFont}
              />
              <Text style={styles.factLabel}>Due</Text>
              <Text style={[styles.factValue, overdue && styles.factOverdue]}>
                {formatDate(task.dueDate)} · {formatDueDate(task.dueDate)}
              </Text>
            </View>
            <View style={styles.factDivider} />
            <View style={styles.factRow}>
              <Ionicons
                name="time-outline"
                size={17}
                color={Colors.lightFont}
              />
              <Text style={styles.factLabel}>Updated</Text>
              <Text style={styles.factValue}>
                {formatDateTime(task.updatedAt)}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <SectionHeader title="Description" />
            <View style={styles.descriptionCard}>
              <RenderHtml content={task.description} collapsedLines={6} />
            </View>
          </View>

          {/* People */}
          <View style={styles.section}>
            <SectionHeader title="People" />
            <View style={styles.peopleCard}>
              {renderPersonRow(
                "Assigned To",
                assignee?.name,
                assignee?.jobTitle
              )}
              <View style={styles.factDivider} />
              {renderPersonRow("Created By", creator?.name, creator?.jobTitle)}
              <View style={styles.factDivider} />
              {renderPersonRow(
                "Approver",
                approver?.name,
                approver?.jobTitle,
                "Anyone who can approve"
              )}
            </View>
          </View>

          {/* Comments */}
          <View style={styles.section}>
            <SectionHeader
              title={`Comments (${comments.length})`}
              actionTitle="See all"
              onActionPress={() =>
                navigation.navigate("TaskComments", { taskId: task.id })
              }
            />
            {comments.length > 0 ? (
              <View style={styles.commentsCard}>
                {comments.slice(0, 2).map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    isOwnComment={comment.authorId === user?.id}
                  />
                ))}
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addCommentRow}
                onPress={() =>
                  navigation.navigate("TaskComments", { taskId: task.id })
                }
                activeOpacity={0.7}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={17}
                  color={Colors.primary}
                />
                <Text style={styles.addCommentText}>Start the discussion</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Activity */}
          <View style={styles.section}>
            <SectionHeader
              title="Activity"
              actionTitle="See all"
              onActionPress={() =>
                navigation.navigate("TaskActivity", { taskId: task.id })
              }
            />
            <View style={styles.activityCard}>
              {activity.slice(0, 4).map((item, index, list) => (
                <TimelineItem
                  key={item.id}
                  item={item}
                  isLast={index === list.length - 1}
                  showDate
                />
              ))}
            </View>
          </View>

          {renderActions()}
        </ScrollView>
      </WhiteContainer>
    </Container>
  );
};

export default TaskDetails;

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  content: {
    paddingBottom: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.black,
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  projectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 10,
  },
  projectDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  projectName: {
    fontSize: 13,
    color: Colors.lightFont,
    fontWeight: "500",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  rejectionBanner: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: Colors.dangerSoft,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  rejectionText: {
    flex: 1,
  },
  rejectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.danger,
  },
  rejectionBody: {
    fontSize: 13,
    color: Colors.secondaryFont,
    lineHeight: 19,
    marginTop: 3,
  },
  factsCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    paddingHorizontal: 14,
    marginTop: 18,
  },
  factRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    gap: 10,
  },
  factLabel: {
    fontSize: 13,
    color: Colors.mutedFont,
    width: 62,
  },
  factValue: {
    flex: 1,
    fontSize: 13,
    color: Colors.secondaryFont,
    fontWeight: "500",
    textAlign: "right",
  },
  factOverdue: {
    color: Colors.danger,
    fontWeight: "600",
  },
  factDivider: {
    height: 1,
    backgroundColor: Colors.leaderboardBorderVeryLight,
  },
  section: {
    marginTop: 28,
  },
  descriptionCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    padding: 14,
  },
  peopleCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    paddingHorizontal: 14,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    gap: 12,
  },
  personLabel: {
    fontSize: 13,
    color: Colors.mutedFont,
  },
  personValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  personText: {
    alignItems: "flex-end",
  },
  personName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
  },
  personSubtitle: {
    fontSize: 11,
    color: Colors.mutedFont,
    marginTop: 1,
  },
  personFallback: {
    fontSize: 13,
    color: Colors.lightFont,
    fontStyle: "italic",
  },
  commentsCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    paddingHorizontal: 14,
  },
  addCommentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 14,
  },
  addCommentText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  activityCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    padding: 14,
  },
  actions: {
    marginTop: 32,
    gap: 12,
  },
});
