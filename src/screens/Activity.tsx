import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Container, Header, WhiteContainer } from "../components";
import { ActivityScreenProps } from "../navigation/NavigationTypes";
import Colors from "../configs/Colors";

// Mock data for activities
const mockActivities = [
  {
    id: "1",
    type: "created",
    taskTitle: "Complete project proposal",
    timestamp: "2026-04-27T10:30:00",
    icon: "add-circle",
    color: Colors.primary,
  },
  {
    id: "2",
    type: "completed",
    taskTitle: "Code review",
    timestamp: "2026-04-27T09:15:00",
    icon: "checkmark-circle",
    color: Colors.primary,
  },
  {
    id: "3",
    type: "edited",
    taskTitle: "Team meeting",
    timestamp: "2026-04-26T16:45:00",
    icon: "create",
    color: Colors.neutral,
  },
  {
    id: "4",
    type: "completed",
    taskTitle: "Update documentation",
    timestamp: "2026-04-26T14:20:00",
    icon: "checkmark-circle",
    color: Colors.primary,
  },
  {
    id: "5",
    type: "deleted",
    taskTitle: "Old task item",
    timestamp: "2026-04-26T11:00:00",
    icon: "trash",
    color: Colors.tertiary,
  },
  {
    id: "6",
    type: "created",
    taskTitle: "Design mockups",
    timestamp: "2026-04-25T15:30:00",
    icon: "add-circle",
    color: Colors.primary,
  },
  {
    id: "7",
    type: "edited",
    taskTitle: "Complete project proposal",
    timestamp: "2026-04-25T10:00:00",
    icon: "create",
    color: Colors.neutral,
  },
];

const Activity: React.FC<ActivityScreenProps> = (
  props: ActivityScreenProps,
) => {
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "today" | "week"
  >("all");

  // Format timestamp to readable format
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60),
      );
      return `${diffInMinutes} ${
        diffInMinutes === 1 ? "minute" : "minutes"
      } ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
    }
  };

  // Get activity action text
  const getActionText = (type: string) => {
    switch (type) {
      case "created":
        return "Created task";
      case "completed":
        return "Completed task";
      case "edited":
        return "Edited task";
      case "deleted":
        return "Deleted task";
      default:
        return "Activity";
    }
  };

  // Filter activities based on selected filter
  const filteredActivities = mockActivities.filter((activity) => {
    const activityDate = new Date(activity.timestamp);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (selectedFilter === "today") {
      return diffInDays === 0;
    } else if (selectedFilter === "week") {
      return diffInDays <= 7;
    }
    return true;
  });

  return (
    <Container>
      <Header title="Activity" />
      <WhiteContainer style={styles.container}>
        {/* Filter Section */}
        <View style={styles.filterSection}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === "all" && styles.activeFilterButton,
            ]}
            onPress={() => setSelectedFilter("all")}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === "all" && styles.activeFilterButtonText,
              ]}
            >
              All Time
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === "today" && styles.activeFilterButton,
            ]}
            onPress={() => setSelectedFilter("today")}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === "today" && styles.activeFilterButtonText,
              ]}
            >
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === "week" && styles.activeFilterButton,
            ]}
            onPress={() => setSelectedFilter("week")}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === "week" && styles.activeFilterButtonText,
              ]}
            >
              This Week
            </Text>
          </TouchableOpacity>
        </View>

        {/* Activity List */}
        <ScrollView
          contentContainerStyle={styles.activityList}
          showsVerticalScrollIndicator={false}
        >
          {filteredActivities.length > 0 ? (
            <>
              <Text style={styles.activityCount}>
                {filteredActivities.length}{" "}
                {filteredActivities.length === 1 ? "activity" : "activities"}
              </Text>
              {filteredActivities.map((activity, index) => (
                <View key={activity.id} style={styles.activityItem}>
                  {/* Timeline Line */}
                  {index !== filteredActivities.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}

                  {/* Activity Icon */}
                  <View
                    style={[
                      styles.activityIcon,
                      { backgroundColor: activity.color + "20" },
                    ]}
                  >
                    <Ionicons
                      name={activity.icon as any}
                      size={20}
                      color={activity.color}
                    />
                  </View>

                  {/* Activity Content */}
                  <View style={styles.activityContent}>
                    <Text style={styles.activityAction}>
                      {getActionText(activity.type)}
                    </Text>
                    <Text style={styles.activityTaskTitle}>
                      {activity.taskTitle}
                    </Text>
                    <Text style={styles.activityTimestamp}>
                      {formatTimestamp(activity.timestamp)}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="time-outline"
                size={64}
                color={Colors.mutedFont}
              />
              <Text style={styles.emptyStateTitle}>No activity</Text>
              <Text style={styles.emptyStateText}>
                No activities found for the selected period
              </Text>
            </View>
          )}
        </ScrollView>
      </WhiteContainer>
    </Container>
  );
};

export default Activity;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  filterSection: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    alignItems: "center",
  },
  activeFilterButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.mutedFont,
  },
  activeFilterButtonText: {
    color: Colors.white,
  },
  activityList: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  activityCount: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.mutedFont,
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: "row",
    marginBottom: 24,
    position: "relative",
  },
  timelineLine: {
    position: "absolute",
    left: 19,
    top: 40,
    bottom: -24,
    width: 2,
    backgroundColor: Colors.borderGray,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
    paddingTop: 4,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 4,
  },
  activityTaskTitle: {
    fontSize: 15,
    color: Colors.mutedFont,
    marginBottom: 4,
  },
  activityTimestamp: {
    fontSize: 12,
    color: Colors.mutedFont,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.mutedFont,
    textAlign: "center",
  },
});
