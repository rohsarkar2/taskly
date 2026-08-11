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
import { ProjectModel } from "../models/project";
import {
  formatShortDate,
  getAvatarColor,
  getProjectStatusMeta,
} from "../utils/Formatters";
import Badge from "./Badge";
import ProgressBar from "./ProgressBar";

type ProjectCardProps = {
  project: ProjectModel;
  onPress?: (project: ProjectModel) => void;
  style?: ViewStyle;
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onPress,
  style,
}) => {
  // The API sends no project color, so tint it off the id like avatars do.
  const color = getAvatarColor(project.id);
  const progress = Math.round(project.taskStats.completionPercentage);

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={() => onPress?.(project)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: `${color}1A` }]}>
          <Ionicons name="folder-open" size={20} color={color} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>
            {project.name}
          </Text>
          <Text style={styles.description} numberOfLines={1}>
            {project.code ? `${project.code} · ` : ""}
            {project.memberCount} member
            {project.memberCount === 1 ? "" : "s"}
          </Text>
        </View>
        <Badge meta={getProjectStatusMeta(project.status)} size="small" />
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>{progress}% Complete</Text>
        <Text style={styles.taskCount}>
          {project.taskStats.completed}/{project.taskStats.total} tasks
        </Text>
      </View>
      <ProgressBar progress={progress} color={color} />

      <View style={styles.footer}>
        <View style={styles.dueRow}>
          <Ionicons name="person-outline" size={13} color={Colors.lightFont} />
          <Text style={styles.dueText}>
            {project.taskStats.mine} assigned to you
          </Text>
        </View>
        {project.endDate ? (
          <View style={styles.dueRow}>
            <Ionicons name="flag-outline" size={13} color={Colors.lightFont} />
            <Text style={styles.dueText}>
              Due {formatShortDate(project.endDate)}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default ProjectCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderGray,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
  },
  description: {
    fontSize: 13,
    color: Colors.mutedFont,
    lineHeight: 18,
    marginTop: 4,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.secondaryFont,
  },
  taskCount: {
    fontSize: 12,
    color: Colors.mutedFont,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  dueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dueText: {
    fontSize: 12,
    color: Colors.lightFont,
    fontWeight: "500",
  },
});
