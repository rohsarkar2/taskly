import React, { useEffect, useMemo, useState } from "react";
import { SectionList, StyleSheet, Text } from "react-native";
import {
  Container,
  EmptyState,
  Header,
  Loader,
  TimelineItem,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import { ActivityModel, TaskModel } from "../models/task";
import { TaskActivityScreenProps } from "../navigation/NavigationTypes";
import TaskService from "../services/TaskService";
import { formatDate } from "../utils/Formatters";
import { mapApiTaskDetails } from "../utils/Mappers";

const TaskActivity: React.FC<TaskActivityScreenProps> = ({ route }) => {
  const { taskId } = route.params;

  const [task, setTask] = useState<TaskModel | null>(null);
  const [activity, setActivity] = useState<ActivityModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // The timeline rides along inside the task detail payload.
  useEffect(() => {
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
          setError(caught?.message ?? "Couldn't load this activity feed.");
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
  }, [taskId]);

  // Grouped by day, newest first — the backend owns the ordering.
  const sections = useMemo(() => {
    const grouped = new Map<string, ActivityModel[]>();

    activity.forEach((item) => {
      const day = formatDate(item.createdAt);
      grouped.set(day, [...(grouped.get(day) ?? []), item]);
    });

    return Array.from(grouped, ([title, data]) => ({ title, data }));
  }, [activity]);

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
            loading ? (
              <Loader size="large" />
            ) : (
              <EmptyState
                icon={error ? "cloud-offline-outline" : undefined}
                title={error ? "Couldn't load activity" : "No activity yet"}
                subtitle={
                  error ?? "Every change to this task will be recorded here."
                }
              />
            )
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
