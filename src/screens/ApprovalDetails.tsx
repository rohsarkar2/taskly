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
import { ActivityModel, TaskModel } from "../models/task";
import { ApprovalDetailsScreenProps } from "../navigation/NavigationTypes";
import TaskService from "../services/TaskService";
import { useAppSelector } from "../store/hooks";
import {
  formatDate,
  getAvatarColor,
  getTaskPriorityMeta,
  getTaskStatusMeta,
} from "../utils/Formatters";
import { mapApiTaskDetails } from "../utils/Mappers";

const ApprovalDetails: React.FC<ApprovalDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { taskId } = route.params;
  const user = useAppSelector((state) => state.user.userData);

  const [task, setTask] = useState<TaskModel | null>(null);
  const [activity, setActivity] = useState<ActivityModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        try {
          const response = await TaskService.getTaskDetails(taskId);
          if (!active) return;

          const details = mapApiTaskDetails(response?.data);
          setTask(details.task);
          setActivity(details.timeline);
        } catch (caught: any) {
          if (active) {
            setError(caught?.message ?? "Couldn't load this approval.");
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
    }, [taskId]),
  );

  if (loading) {
    return (
      <Container>
        <Header title="Approval" showBack />
        <WhiteContainer>
          <Loader style={styles.screenLoader} size="large" />
        </WhiteContainer>
      </Container>
    );
  }

  if (!task) {
    return (
      <Container>
        <Header title="Approval" showBack />
        <WhiteContainer>
          <EmptyState
            icon="alert-circle-outline"
            title={error ? "Couldn't load approval" : "Task not found"}
            subtitle={error ?? "This approval may have already been handled."}
          />
        </WhiteContainer>
      </Container>
    );
  }

  const project = task.project;
  const assignee = task.assignee;
  const creator = task.creator;

  // The API is the authority here — it rejects a non-approver with a 403.
  const isApprover = task.approvers.some((person) => person.id === user?.id);
  const isOwnWork = creator?.id === user?.id;

  const handleApprove = () => {
    Alert.alert("Approve task", `Mark "${task.title}" as completed?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: async () => {
          setWorking(true);

          try {
            const response = await TaskService.approveTask(task.id);
            Alert.alert(
              "Approved",
              response?.message ?? "The task has been marked completed.",
              [{ text: "OK", onPress: () => navigation.goBack() }],
            );
          } catch (caught: any) {
            Alert.alert(
              "Couldn't approve",
              caught?.message ?? "Something went wrong. Please try again.",
            );
          } finally {
            setWorking(false);
          }
        },
      },
    ]);
  };

  return (
    <Container>
      <Header title="Approval Review" showBack />
      <WhiteContainer style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{task.title}</Text>

          <View style={styles.badgeRow}>
            <Badge meta={getTaskStatusMeta(task.status)} />
            <Badge meta={getTaskPriorityMeta(task.priority)} icon="flag" />
          </View>

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

          {!isApprover ? (
            <View style={styles.warning}>
              <Ionicons name="lock-closed" size={17} color={Colors.warning} />
              <Text style={styles.warningText}>
                {isOwnWork
                  ? "You created this task, so you can't approve it. Another eligible approver has to review it."
                  : "You aren't listed as an approver on this task."}
              </Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <SectionHeader title="What was submitted" />
            <View style={styles.card}>
              <RenderHtml content={task.description} collapsedLines={8} />
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeader title="Details" />
            <View style={styles.card}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created by</Text>
                <View style={styles.person}>
                  <Avatar
                    name={creator?.name ?? "Unknown"}
                    image={creator?.image}
                    size={26}
                  />
                  <Text style={styles.personName}>
                    {creator?.name ?? "Unknown"}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Assigned to</Text>
                <View style={styles.person}>
                  <Avatar
                    name={assignee?.name ?? "Unknown"}
                    image={assignee?.image}
                    size={26}
                  />
                  <Text style={styles.personName}>
                    {assignee?.name ?? "Unknown"}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Due date</Text>
                <Text style={styles.detailValue}>
                  {formatDate(task.dueDate)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="History"
              actionTitle="Full timeline"
              onActionPress={() =>
                navigation.navigate("TaskActivity", { taskId: task.id })
              }
            />
            <View style={styles.card}>
              {activity.length > 0 ? (
                activity.slice(0, 4).map((item, index, list) => (
                  <TimelineItem
                    key={item.id}
                    item={item}
                    isLast={index === list.length - 1}
                    showDate
                  />
                ))
              ) : (
                <Text style={styles.detailLabel}>No activity yet</Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.commentsLink}
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
            <Text style={styles.commentsLinkText}>
              View discussion ({task.commentCount})
            </Text>
          </TouchableOpacity>

          {isApprover ? (
            <View style={styles.actions}>
              <Button title="Approve" loading={working} onPress={handleApprove} />
              <Button
                title="Return for Changes"
                variant="secondary"
                onPress={() =>
                  navigation.navigate("RejectTask", {
                    taskId: task.id,
                    mode: "return",
                  })
                }
              />
              <Button
                title="Reject"
                variant="secondary"
                textStyle={styles.rejectText}
                onPress={() =>
                  navigation.navigate("RejectTask", {
                    taskId: task.id,
                    mode: "reject",
                  })
                }
              />
            </View>
          ) : null}
        </ScrollView>
      </WhiteContainer>
    </Container>
  );
};

export default ApprovalDetails;

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
  title: {
    fontSize: 21,
    fontWeight: "700",
    color: Colors.black,
    lineHeight: 29,
    letterSpacing: -0.4,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  projectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 12,
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
  warning: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: Colors.warningSoft,
    borderRadius: 12,
    padding: 13,
    marginTop: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: Colors.secondaryFont,
    lineHeight: 19,
  },
  section: {
    marginTop: 28,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    padding: 14,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    gap: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.mutedFont,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.secondaryFont,
  },
  person: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  personName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.leaderboardBorderVeryLight,
    marginVertical: 4,
  },
  commentsLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
  },
  commentsLinkText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  actions: {
    marginTop: 32,
    gap: 12,
  },
  rejectText: {
    color: Colors.danger,
  },
});
