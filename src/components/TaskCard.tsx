import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../configs/Colors";
import { TaskModel, TaskPersonModel } from "../models/task";
import {
  formatDueDate,
  formatShortDate,
  getAvatarColor,
  getTaskPriorityMeta,
  getTaskStatusIcon,
  getTaskStatusMeta,
  isOverdue,
} from "../utils/Formatters";
import Avatar from "./Avatar";
import Badge from "./Badge";

/**
 * The card only needs the identity fields, so the trimmed task shape the
 * dashboard endpoints return fits alongside a full TaskModel.
 */
export type TaskCardTask = Pick<
  TaskModel,
  "id" | "title" | "status" | "priority" | "dueDate"
> & {
  project?: { id: string; name: string } | null;
  assignee?: TaskPersonModel | null;
  commentCount?: number;
};

export type TaskCardProps<T extends TaskCardTask = TaskCardTask> = {
  task: T;
  onPress?: (task: T) => void;
  showProject?: boolean;
  showAssignee?: boolean;
  style?: ViewStyle;
};

// Generic so callers holding a full TaskModel keep it in their onPress handler.
const TaskCard = <T extends TaskCardTask>({
  task,
  onPress,
  showProject = true,
  showAssignee = true,
  style,
}: TaskCardProps<T>) => {
  const project = task.project;
  const assignee = task.assignee;
  // The API sends no project color, so tint it off the id like avatars do.
  const projectColor = project ? getAvatarColor(project.id) : Colors.primary;
  const statusMeta = getTaskStatusMeta(task.status);
  const priorityMeta = getTaskPriorityMeta(task.priority);
  const overdue = isOverdue(task.dueDate, task.status);
  const isCompleted = task.status === "completed";

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={() => onPress?.(task)}
      activeOpacity={0.7}
    >
      <View style={styles.topRow}>
        <View style={[styles.accent, { backgroundColor: statusMeta.color }]} />
        <Text
          style={[styles.title, isCompleted && styles.titleCompleted]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
      </View>

      <View style={styles.metaRow}>
        {showProject && project?.name ? (
          <View style={styles.projectPill}>
            <View
              style={[styles.projectDot, { backgroundColor: projectColor }]}
            />
            <Text style={styles.projectName} numberOfLines={1}>
              {project.name}
            </Text>
          </View>
        ) : null}
        <Badge meta={priorityMeta} size="small" />
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Badge
            meta={statusMeta}
            icon={getTaskStatusIcon(task.status)}
            size="small"
          />
          <View style={styles.dueRow}>
            <Ionicons
              name="calendar-outline"
              size={13}
              color={overdue ? Colors.danger : Colors.lightFont}
            />
            <Text style={[styles.dueText, overdue && styles.dueTextOverdue]}>
              {isCompleted
                ? formatShortDate(task.dueDate)
                : formatDueDate(task.dueDate)}
            </Text>
          </View>
        </View>

        <View style={styles.footerRight}>
          {(task.commentCount ?? 0) > 0 ? (
            <View style={styles.commentRow}>
              <Ionicons
                name="chatbubble-outline"
                size={13}
                color={Colors.mutedFont}
              />
              <Text style={styles.commentCount}>{task.commentCount}</Text>
            </View>
          ) : null}
          {showAssignee && assignee ? (
            <Avatar name={assignee.name} image={assignee.image} size={26} />
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TaskCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderGray,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  accent: {
    width: 3,
    alignSelf: "stretch",
    minHeight: 20,
    borderRadius: 2,
    marginRight: 10,
    marginTop: 2,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
    lineHeight: 21,
  },
  titleCompleted: {
    color: Colors.lightFont,
    textDecorationLine: "line-through",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginLeft: 13,
    gap: 8,
  },
  projectPill: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "60%",
    gap: 6,
  },
  projectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  projectName: {
    fontSize: 12,
    color: Colors.lightFont,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginLeft: 13,
    gap: 8,
  },
  footerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  dueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dueText: {
    fontSize: 12,
    color: Colors.lightFont,
    fontWeight: "500",
  },
  dueTextOverdue: {
    color: Colors.danger,
    fontWeight: "600",
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  commentCount: {
    fontSize: 12,
    color: Colors.mutedFont,
    fontWeight: "500",
  },
});
