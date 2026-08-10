import React, { useMemo } from "react";
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
  getProjectById,
  getTaskById,
  getUserById,
} from "../data";
import { ApprovalDetailsScreenProps } from "../navigation/NavigationTypes";
import { useAppSelector } from "../store/hooks";
import {
  formatDate,
  getTaskPriorityMeta,
  getTaskStatusMeta,
} from "../utils/Formatters";

const ApprovalDetails: React.FC<ApprovalDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { taskId } = route.params;
  const user = useAppSelector((state) => state.user.userData);
  const task = getTaskById(taskId);
  const activity = useMemo(() => getActivityByTaskId(taskId), [taskId]);

  if (!task) {
    return (
      <Container>
        <Header title="Approval" showBack />
        <WhiteContainer>
          <EmptyState
            icon="alert-circle-outline"
            title="Task not found"
            subtitle="This approval may have already been handled."
          />
        </WhiteContainer>
      </Container>
    );
  }

  const project = getProjectById(task.projectId);
  const assignee = getUserById(task.assigneeId);
  const creator = getUserById(task.creatorId);

  const isOwnWork = task.creatorId === user?.id;

  const handleApprove = () => {
    Alert.alert("Approve task", `Mark "${task.title}" as completed?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: () =>
          Alert.alert("Approved", "The task has been marked completed.", [
            { text: "OK", onPress: () => navigation.goBack() },
          ]),
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

          {isOwnWork ? (
            <View style={styles.warning}>
              <Ionicons name="lock-closed" size={17} color={Colors.warning} />
              <Text style={styles.warningText}>
                You created this task, so you can't approve it. Another eligible
                approver has to review it.
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
                  <Avatar name={creator?.name ?? "Unknown"} size={26} />
                  <Text style={styles.personName}>
                    {creator?.name ?? "Unknown"}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Assigned to</Text>
                <View style={styles.person}>
                  <Avatar name={assignee?.name ?? "Unknown"} size={26} />
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

          {!isOwnWork ? (
            <View style={styles.actions}>
              <Button title="Approve" onPress={handleApprove} />
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
