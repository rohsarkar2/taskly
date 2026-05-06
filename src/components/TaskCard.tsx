import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../configs/Colors";

export type TaskCardProps = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "completed";
  onPress?: (id: string) => void;
};

const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  description,
  dueDate,
  status,
  onPress,
}) => {
  const isCompleted = status === "completed";

  return (
    <TouchableOpacity
      style={[styles.container, isCompleted && styles.completedContainer]}
      onPress={() => onPress?.(id)}
      activeOpacity={0.7}
    >
      <View style={styles.statusIndicator}>
        <View
          style={[
            styles.statusDot,
            isCompleted ? styles.statusDotCompleted : styles.statusDotPending,
          ]}
        />
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.title, isCompleted && styles.completedTitle]}
          numberOfLines={2}
        >
          {title}
        </Text>
        {description ? (
          <Text
            style={[styles.description, isCompleted && styles.completedText]}
            numberOfLines={2}
          >
            {description}
          </Text>
        ) : null}
        <View style={styles.dateContainer}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={isCompleted ? Colors.mutedFont : Colors.primary}
          />
          <Text style={[styles.date, isCompleted && styles.completedText]}>
            {new Date(dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TaskCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
    // shadowOpacity: 0.05,
    // shadowRadius: 4,
    // elevation: 2,
  },
  completedContainer: {
    backgroundColor: "#F8F9FA",
    opacity: 0.8,
  },
  statusIndicator: {
    paddingTop: 6,
    paddingRight: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusDotPending: {
    backgroundColor: "#FFB020",
  },
  statusDotCompleted: {
    backgroundColor: "#4CAF50",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    lineHeight: 22,
    marginBottom: 6,
  },
  completedTitle: {
    textDecorationLine: "line-through",
    color: Colors.mutedFont,
  },
  description: {
    fontSize: 14,
    color: Colors.mutedFont,
    lineHeight: 20,
    marginBottom: 12,
  },
  completedText: {
    color: "#9E9E9E",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  date: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 6,
    fontWeight: "600",
  },
});
