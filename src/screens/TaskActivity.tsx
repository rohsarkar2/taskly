import React, { useMemo } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import {
  Container,
  EmptyState,
  Header,
  TimelineItem,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import { getActivityByTaskId, getTaskById } from "../data";
import { ActivityModel } from "../models/task";
import { TaskActivityScreenProps } from "../navigation/NavigationTypes";
import { formatDate } from "../utils/Formatters";

const TaskActivity: React.FC<TaskActivityScreenProps> = ({ route }) => {
  const { taskId } = route.params;
  const task = getTaskById(taskId);

  // Grouped by day, newest first — the backend owns this feed.
  const sections = useMemo(() => {
    const grouped = new Map<string, ActivityModel[]>();

    getActivityByTaskId(taskId).forEach((item) => {
      const day = formatDate(item.createdAt);
      grouped.set(day, [...(grouped.get(day) ?? []), item]);
    });

    return Array.from(grouped, ([title, data]) => ({ title, data }));
  }, [taskId]);

  return (
    <Container>
      <Header title="Activity" showBack />
      <WhiteContainer style={styles.container}>
        {task ? (
          <Text style={styles.taskTitle} numberOfLines={1}>
            {task.title}
          </Text>
        ) : null}

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item, index, section }) => (
            <TimelineItem
              item={item}
              isLast={index === section.data.length - 1}
            />
          )}
          contentContainerStyle={[
            styles.list,
            sections.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <EmptyState
              icon="time-outline"
              title="No activity yet"
              subtitle="Every change to this task will be recorded here."
            />
          }
        />
      </WhiteContainer>
    </Container>
  );
};

export default TaskActivity;

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  taskTitle: {
    fontSize: 13,
    color: Colors.mutedFont,
    fontWeight: "500",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.leaderboardBorderVeryLight,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.mutedFont,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 22,
    marginBottom: 14,
  },
  list: {
    paddingBottom: 40,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
