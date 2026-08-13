import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text } from "react-native";
import {
  Container,
  EmptyState,
  FilterChips,
  Header,
  Loader,
  SearchBar,
  WhiteContainer,
  TaskCard,
} from "../components";
import type { ChipItem } from "../components";
import Colors from "../configs/Colors";
import { TaskModel } from "../models/task";
import { TeamTasksScreenProps } from "../navigation/NavigationTypes";
import TaskService from "../services/TaskService";
import { useAppSelector } from "../store/hooks";
import { isOverdue } from "../utils/Formatters";
import { mapApiTask } from "../utils/Mappers";

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

/** Overdue has no server-side equivalent, so that chip filters locally. */
const FILTER_STATUS: Record<TeamTaskFilter, string | undefined> = {
  all: undefined,
  overdue: undefined,
  "in-progress": "in_progress",
  "pending-approval": "pending_approval",
  blocked: "blocked",
};

const TeamTasks: React.FC<TeamTasksScreenProps> = ({ navigation }) => {
  const user = useAppSelector((state) => state.user.userData);
  const [filter, setFilter] = useState<TeamTaskFilter>("all");
  const [query, setQuery] = useState("");
  const [teamTasks, setTeamTasks] = useState<TaskModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // `scope=team` is project work that isn't assigned to you.
  const loadTasks = useCallback(async () => {
    try {
      setError(null);
      const response = await TaskService.teamTasks({
        status: FILTER_STATUS[filter],
        search: query.trim() || undefined,
        sortBy: "dueDate",
        sortOrder: "asc",
      });
      setTeamTasks((response?.data?.tasks ?? []).map(mapApiTask));
    } catch (caught: any) {
      setError(caught?.message ?? "Couldn't load team tasks.");
      setTeamTasks([]);
    }
  }, [filter, query]);

  useEffect(() => {
    let active = true;

    // Debounced so typing in the search bar doesn't fire a call per keystroke.
    const timer = setTimeout(async () => {
      await loadTasks();
      if (active) {
        setLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [loadTasks]);

  const visible = useMemo(
    () =>
      filter === "overdue"
        ? teamTasks.filter((task) => isOverdue(task.dueDate, task.status))
        : teamTasks,
    [teamTasks, filter]
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

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
                title={error ? "Couldn't load team tasks" : "No team tasks here"}
                subtitle={
                  error ??
                  (user?.role === "team-member"
                    ? "Team views are available to Team Leads and Managers."
                    : "Nothing matches this filter right now.")
                }
              />
            )
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
