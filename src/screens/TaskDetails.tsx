import React, { useCallback, useState } from "react";
import {
  Alert,
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
  Badge,
  Button,
  CommentItem,
  Container,
  EmptyState,
  Header,
  Loader,
  RenderHtml,
  SectionHeader,
  TimelineItem,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import {
  ActivityModel,
  AttachmentModel,
  CommentModel,
  TaskModel,
  TaskPermissionsModel,
} from "../models/task";
import { TaskDetailsScreenProps } from "../navigation/NavigationTypes";
import CommentService from "../services/CommentService";
import TaskService from "../services/TaskService";
import { useAppSelector } from "../store/hooks";
import {
  formatDate,
  formatDateTime,
  formatDueDate,
  getAvatarColor,
  getTaskPriorityMeta,
  getTaskStatusIcon,
  getTaskStatusMeta,
  isOverdue,
} from "../utils/Formatters";
import { mapApiComment, mapApiTaskDetails } from "../utils/Mappers";

const TaskDetails: React.FC<TaskDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { taskId } = route.params;
  const user = useAppSelector((state) => state.user.userData);

  const [task, setTask] = useState<TaskModel | null>(null);
  const [permissions, setPermissions] = useState<TaskPermissionsModel | null>(
    null,
  );
  const [activity, setActivity] = useState<ActivityModel[]>([]);
  const [comments, setComments] = useState<CommentModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTask = useCallback(async () => {
    try {
      setError(null);
      const response = await TaskService.getTaskDetails(taskId);
      const details = mapApiTaskDetails(response?.data);

      setTask(details.task);
      setPermissions(details.permissions);
      setActivity(details.timeline);
    } catch (caught: any) {
      setError(caught?.message ?? "Couldn't load this task.");
    }

    // Comments have their own paginated endpoint; only the preview is needed
    // here, so a failure shouldn't take the whole screen down.
    try {
      const response = await CommentService.commentList(taskId, 1, 5);
      setComments((response?.data?.comments ?? []).map(mapApiComment));
    } catch {
      setComments([]);
    }
  }, [taskId]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        await loadTask();
        if (active) {
          setLoading(false);
        }
      })();

      return () => {
        active = false;
      };
    }, [loadTask]),
  );

  if (loading) {
    return (
      <Container>
        <Header title="Task" showBack />
        <WhiteContainer>
          <Loader style={styles.screenLoader} size="large" />
        </WhiteContainer>
      </Container>
    );
  }

  if (!task) {
    return (
      <Container>
        <Header title="Task" showBack />
        <WhiteContainer>
          <EmptyState
            icon="alert-circle-outline"
            title={error ? "Couldn't load task" : "Task not found"}
            subtitle={error ?? "This task may have been deleted or moved."}
          />
        </WhiteContainer>
      </Container>
    );
  }

  const project = task.project;
  const assignee = task.assignee;
  const creator = task.creator;
  const currentStatus = task.status;
  const statusMeta = getTaskStatusMeta(currentStatus);
  const overdue = isOverdue(task.dueDate, currentStatus);

  const isAssignee = assignee?.id === user?.id;
  // Approvers can come back as bare ids with no name to show.
  const namedApprovers = task.approvers.filter((person) => person.name);
  const canApprove =
    currentStatus === "pending-approval" &&
    task.approvers.some((person) => person.id === user?.id);

  /** Every transition round-trips, then the screen refetches the real state. */
  const runAction = async (
    action: () => Promise<any>,
    fallbackMessage: string,
  ) => {
    setWorking(true);

    try {
      const response = await action();
      await loadTask();
      Alert.alert("Task updated", response?.message ?? fallbackMessage);
    } catch (caught: any) {
      Alert.alert(
        "Couldn't update",
        caught?.message ?? "Something went wrong. Please try again.",
      );
    } finally {
      setWorking(false);
    }
  };

  // TaskService.uploadAttachments posts the multipart body; picking the file
  // needs a document picker dependency that isn't installed yet.
  const handleAddAttachment = () =>
    Alert.alert(
      "Add attachment",
      "Add a file picker (react-native-document-picker) to enable uploads.",
    );

  const handleDeleteAttachment = (attachment: AttachmentModel) =>
    Alert.alert("Remove attachment", `Delete "${attachment.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await TaskService.deleteAttachment(task.id, attachment.id);
          } catch (caught: any) {
            Alert.alert(
              "Couldn't remove",
              caught?.message ?? "Something went wrong. Please try again.",
            );
          }
          await loadTask();
        },
      },
    ]);

  const handleDelete = () =>
    Alert.alert("Delete task", "This can't be undone. Delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await TaskService.deleteTask(task.id);
            navigation.goBack();
          } catch (caught: any) {
            Alert.alert(
              "Couldn't delete",
              caught?.message ?? "Something went wrong. Please try again.",
            );
          }
        },
      },
    ]);

  const renderPersonRow = (
    label: string,
    name?: string,
    image?: string,
    fallback?: string,
    ifApprover?: boolean,
  ) => (
    <View style={styles.personRow}>
      <Text style={styles.personLabel}>{label}</Text>
      {name ? (
        <View style={styles.personValue}>
          {/* {!ifApprover && <Avatar name={name} image={image} size={30} />} */}
          <View style={styles.personText}>
            <Text style={styles.personName}>{name}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.personFallback}>{fallback ?? "Unassigned"}</Text>
      )}
    </View>
  );

  const renderActions = () => {
    const actions: React.ReactNode[] = [];

    // The assignment has to be accepted before the work can start.
    if (isAssignee && !task.assignmentAcceptedAt) {
      actions.push(
        <Button
          key="accept"
          title="Accept Assignment"
          loading={working}
          onPress={() =>
            runAction(
              () => TaskService.acceptTask(task.id),
              "Assignment accepted.",
            )
          }
        />,
      );
    }

    if (isAssignee && currentStatus === "to-do") {
      actions.push(
        <Button
          key="start"
          title="Start Task"
          loading={working}
          onPress={() =>
            runAction(
              () => TaskService.startTask(task.id),
              "This task is now in progress.",
            )
          }
        />,
      );
    }

    if (isAssignee && currentStatus === "in-progress") {
      // /complete branches server side: it either finishes the task or sends
      // it for review, depending on the project's workflow.
      actions.push(
        <Button
          key="complete"
          title={
            task.requiresApproval ? "Submit for Approval" : "Mark Complete"
          }
          loading={working}
          onPress={() =>
            runAction(
              () => TaskService.completeTask(task.id),
              task.requiresApproval
                ? "Sent to the approver for review."
                : "This task is complete.",
            )
          }
        />,
        <Button
          key="block"
          title="Mark as Blocked"
          variant="secondary"
          loading={working}
          onPress={() =>
            runAction(
              () => TaskService.updateTaskStatus(task.id, "blocked"),
              "This task is marked as blocked.",
            )
          }
        />,
      );
    }

    if (
      isAssignee &&
      (currentStatus === "blocked" || currentStatus === "rejected")
    ) {
      actions.push(
        <Button
          key="resume"
          title="Resume Task"
          loading={working}
          onPress={() =>
            runAction(
              () => TaskService.updateTaskStatus(task.id, "in_progress"),
              "This task is back in progress.",
            )
          }
        />,
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
        />,
      );
    }

    if (permissions?.canEdit) {
      actions.push(
        <Button
          key="edit"
          title="Edit Task"
          variant="secondary"
          onPress={() => navigation.navigate("CreateTask", { taskId: task.id })}
        />,
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
          permissions?.canDelete ? (
            <TouchableOpacity
              onPress={handleDelete}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Delete task"
            >
              <Ionicons name="trash-outline" size={21} color={Colors.danger} />
            </TouchableOpacity>
          ) : undefined
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
                style={[
                  styles.projectDot,
                  { backgroundColor: getAvatarColor(project.id) },
                ]}
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
              {renderPersonRow("Assigned To", assignee?.name, assignee?.image)}
              <View style={styles.factDivider} />
              {renderPersonRow("Created By", creator?.name, creator?.image)}
              <View style={styles.factDivider} />
              {renderPersonRow(
                namedApprovers.length > 1 ? "Approvers" : "Approver",
                // Joining unpopulated approvers would render a bare ", ".
                namedApprovers.map((person) => person.name).join(", ") ||
                  undefined,
                namedApprovers.length === 1
                  ? namedApprovers[0].image
                  : undefined,
                task.requiresApproval
                  ? "Anyone who can approve"
                  : "No approval needed",
                true,
              )}
            </View>
          </View>

          {/* Attachments */}
          <View style={styles.section}>
            <SectionHeader
              title={`Attachments (${task.attachments.length})`}
              actionTitle="Add"
              onActionPress={handleAddAttachment}
            />
            <View style={styles.peopleCard}>
              {task.attachments.length > 0 ? (
                task.attachments.map((attachment, index) => (
                  <React.Fragment key={attachment.id}>
                    {index > 0 ? <View style={styles.factDivider} /> : null}
                    <View style={styles.attachmentRow}>
                      <Ionicons
                        name="document-attach-outline"
                        size={18}
                        color={Colors.lightFont}
                      />
                      <View style={styles.attachmentText}>
                        <Text style={styles.attachmentName} numberOfLines={1}>
                          {attachment.name}
                        </Text>
                        {attachment.uploadedByName ? (
                          <Text style={styles.attachmentMeta}>
                            {attachment.uploadedByName}
                          </Text>
                        ) : null}
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteAttachment(attachment)}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${attachment.name}`}
                      >
                        <Ionicons
                          name="close-circle-outline"
                          size={19}
                          color={Colors.mutedFont}
                        />
                      </TouchableOpacity>
                    </View>
                  </React.Fragment>
                ))
              ) : (
                <EmptyState compact title="No files attached" />
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
                    isOwnComment={comment.author?.id === user?.id}
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
              {activity.length > 0 ? (
                activity
                  .slice(0, 4)
                  .map((item, index, list) => (
                    <TimelineItem
                      key={item.id}
                      item={item}
                      isLast={index === list.length - 1}
                      showDate
                    />
                  ))
              ) : (
                <EmptyState compact title="No activity yet" />
              )}
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
  screenLoader: {
    flex: 1,
  },
  attachmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  attachmentText: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.black,
  },
  attachmentMeta: {
    fontSize: 12,
    color: Colors.mutedFont,
    marginTop: 2,
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
