import React, { useCallback, useMemo, useState } from "react";
import {
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  Container,
  EmptyState,
  Header,
  Loader,
  SegmentedTabs,
  TaskCard,
  WhiteContainer,
} from "../components";
import type { TabItem } from "../components";
import Colors from "../configs/Colors";
import { TaskModel } from "../models/task";
import { MyTasksScreenProps } from "../navigation/NavigationTypes";
import TaskService from "../services/TaskService";
import { daysUntil, isOverdue } from "../utils/Formatters";
import { mapApiTask } from "../utils/Mappers";

type Bucket = "open" | "completed";

const MyTasks: React.FC<MyTasksScreenProps> = ({ navigation }) => {
  const [bucket, setBucket] = useState<Bucket>("open");
  const [assigned, setAssigned] = useState<TaskModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setError(null);
      const response = await TaskService.assignedTasks({
        sortBy: "dueDate",
        sortOrder: "asc",
      });
      setAssigned((response?.data?.tasks ?? []).map(mapApiTask));
    } catch (caught: any) {
      setError(caught?.message ?? "Couldn't load your tasks.");
      setAssigned([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        await loadTasks();
        if (active) {
          setLoading(false);
        }
      })();

      return () => {
        active = false;
      };
    }, [loadTasks]),
  );

  const byDueDate = (a: TaskModel, b: TaskModel) =>
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();

  const sections = useMemo(() => {
    const open = assigned.filter((task) => task.status !== "completed");
    const completed = assigned.filter((task) => task.status === "completed");

    if (bucket === "completed") {
      return [{ title: "Completed", data: [...completed].sort(byDueDate) }];
    }

    const overdue = open.filter((task) => isOverdue(task.dueDate, task.status));
    const today = open.filter((task) => daysUntil(task.dueDate) === 0);
    const upcoming = open.filter((task) => daysUntil(task.dueDate) > 0);

    return [
      { title: "Overdue", data: [...overdue].sort(byDueDate) },
      { title: "Today", data: [...today].sort(byDueDate) },
      { title: "Upcoming", data: [...upcoming].sort(byDueDate) },
    ].filter((section) => section.data.length > 0);
  }, [assigned, bucket]);

  const tabs: TabItem<Bucket>[] = [
    {
      key: "open",
      label: "Open",
      count: assigned.filter((task) => task.status !== "completed").length,
    },
    {
      key: "completed",
      label: "Completed",
      count: assigned.filter((task) => task.status === "completed").length,
    },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  return (
    <Container>
      <Header title="My Tasks" showBack />
      <WhiteContainer style={styles.container}>
        <SegmentedTabs
          tabs={tabs}
          activeKey={bucket}
          onChange={setBucket}
          style={styles.tabs}
        />

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeaderRow}>
              <Text
                style={[
                  styles.sectionHeader,
                  section.title === "Overdue" && styles.sectionHeaderOverdue,
                ]}
              >
                {section.title}
              </Text>
              <Text style={styles.sectionCount}>{section.data.length}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              showAssignee={false}
              onPress={(task) =>
                navigation.navigate("TaskDetails", { taskId: task.id })
              }
            />
          )}
          contentContainerStyle={[
            styles.list,
            sections.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            loading ? (
              <Loader size="large" />
            ) : (
              <EmptyState
                icon={error ? "cloud-offline-outline" : undefined}
                title={
                  error
                    ? "Couldn't load your tasks"
                    : bucket === "open"
                    ? "You're all caught up"
                    : "Nothing finished yet"
                }
                subtitle={
                  error ??
                  (bucket === "open"
                    ? "No open tasks are assigned to you right now."
                    : "Completed tasks will collect here.")
                }
              />
            )
          }
        />
      </WhiteContainer>
    </Container>
  );
};

export default MyTasks;

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  tabs: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 22,
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.black,
  },
  sectionHeaderOverdue: {
    color: Colors.danger,
  },
  sectionCount: {
    fontSize: 12,
    color: Colors.mutedFont,
    fontWeight: "600",
  },
  list: {
    paddingBottom: 40,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
