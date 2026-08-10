import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import {
  Container,
  EmptyState,
  FilterChips,
  Header,
  SearchBar,
  WhiteContainer,
  TaskCard,
} from "../components";
import type { ChipItem } from "../components";
import Colors from "../configs/Colors";
import { getTasksAssignedTo, getTeamMembersFor } from "../data";
import { TaskModel } from "../models/task";
import { TeamTasksScreenProps } from "../navigation/NavigationTypes";
import { useAppSelector } from "../store/hooks";
import { isOverdue } from "../utils/Formatters";

type TeamTaskFilter =
  | "all"
  | "overdue"
  | "in-progress"
  | "pending-approval"
  | "blocked";

const FILTERS: ChipItem<TeamTaskFilter>[] = [
  { key: "all", label: "All" },
  { key: "overdue", label: "Overdue" },
  { key: "in-progress", label: "In Progress" },
  { key: "pending-approval", label: "Pending Approval" },
  { key: "blocked", label: "Blocked" },
];

const TeamTasks: React.FC<TeamTasksScreenProps> = ({ navigation }) => {
  const user = useAppSelector((state) => state.user.userData);
  const [filter, setFilter] = useState<TeamTaskFilter>("all");
  const [query, setQuery] = useState("");

  const teamTasks = useMemo(() => {
    if (!user) return [];

    return getTeamMembersFor(user).flatMap((member) =>
      getTasksAssignedTo(member.id)
    );
  }, [user]);

  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return teamTasks
      .filter((task) => {
        if (filter === "overdue") {
          return isOverdue(task.dueDate, task.status);
        }
        if (filter !== "all") {
          return task.status === filter;
        }
        return true;
      })
      .filter(
        (task) =>
          !normalizedQuery || task.title.toLowerCase().includes(normalizedQuery)
      )
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
  }, [teamTasks, filter, query]);

  const gotoTaskDetails = (task: TaskModel) =>
    navigation.navigate("TaskDetails", { taskId: task.id });

  return (
    <Container>
      <Header title="Team Tasks" showBack />
      <WhiteContainer style={styles.container}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search team tasks"
          style={styles.search}
        />

        <FilterChips chips={FILTERS} activeKey={filter} onChange={setFilter} />

        <Text style={styles.count}>
          {visible.length} task{visible.length === 1 ? "" : "s"}
        </Text>

        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard task={item} onPress={gotoTaskDetails} />
          )}
          contentContainerStyle={[
            styles.list,
            visible.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="No team tasks here"
              subtitle={
                user?.role === "team-member"
                  ? "Team views are available to Team Leads and Managers."
                  : "Nothing matches this filter right now."
              }
            />
          }
        />
      </WhiteContainer>
    </Container>
  );
};

export default TeamTasks;

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  search: {
    marginBottom: 12,
  },
  count: {
    fontSize: 12,
    color: Colors.mutedFont,
    fontWeight: "500",
    marginTop: 12,
  },
  list: {
    paddingTop: 12,
    paddingBottom: 40,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
