import React, { useMemo, useState } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import {
  Container,
  EmptyState,
  Header,
  SegmentedTabs,
  TaskCard,
  WhiteContainer,
} from "../components";
import type { TabItem } from "../components";
import Colors from "../configs/Colors";
import { getTasksAssignedTo } from "../data";
import { TaskModel } from "../models/task";
import { MyTasksScreenProps } from "../navigation/NavigationTypes";
import { useAppSelector } from "../store/hooks";
import { daysUntil, isOverdue } from "../utils/Formatters";

type Bucket = "open" | "completed";

const MyTasks: React.FC<MyTasksScreenProps> = ({ navigation }) => {
  const user = useAppSelector((state) => state.user.userData);
  const [bucket, setBucket] = useState<Bucket>("open");

  const assigned = useMemo(
    () => (user ? getTasksAssignedTo(user.id) : []),
    [user]
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
          ListEmptyComponent={
            <EmptyState
              icon="sparkles-outline"
              title={
                bucket === "open"
                  ? "You're all caught up"
                  : "Nothing finished yet"
              }
              subtitle={
                bucket === "open"
                  ? "No open tasks are assigned to you right now."
                  : "Completed tasks will collect here."
              }
            />
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
