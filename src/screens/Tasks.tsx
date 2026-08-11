import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  Container,
  EmptyState,
  Header,
  Loader,
  OptionSheet,
  SearchBar,
  SegmentedTabs,
  TaskCard,
  WhiteContainer,
} from "../components";
import type { SheetOption, TabItem } from "../components";
import Colors from "../configs/Colors";
import { ProjectModel } from "../models/project";
import { TaskModel } from "../models/task";
import { TaskFilter, TasksScreenProps } from "../navigation/NavigationTypes";
import ProjectService from "../services/ProjectService";
import TaskService, { TaskListParams } from "../services/TaskService";
import { daysUntil, getAvatarColor } from "../utils/Formatters";
import { mapApiProject, mapApiTask } from "../utils/Mappers";

type SortKey = "due-date" | "priority" | "recent";

const SORT_OPTIONS: SheetOption[] = [
  { key: "due-date", label: "Due date", icon: "calendar-outline" },
  { key: "priority", label: "Priority", icon: "flag-outline" },
  { key: "recent", label: "Recently updated", icon: "time-outline" },
];

/** The API sorts for us; the sheet keys map onto its `sortBy` values. */
const SORT_PARAMS: Record<SortKey, Pick<TaskListParams, "sortBy" | "sortOrder">> =
  {
    "due-date": { sortBy: "dueDate", sortOrder: "asc" },
    priority: { sortBy: "priority", sortOrder: "desc" },
    recent: { sortBy: "updatedAt", sortOrder: "desc" },
  };

/** Each tab is either a scope shorthand or a status filter, never both. */
const TAB_PARAMS: Partial<
  Record<TaskFilter, Pick<TaskListParams, "scope" | "status">>
> = {
  "my-tasks": { scope: "assigned" },
  all: {},
  created: { scope: "created" },
  "to-do": { status: "pending" },
  "in-progress": { status: "in_progress" },
  "pending-approval": { status: "pending_approval" },
  completed: { status: "completed" },
  rejected: { status: "rejected" },
  blocked: { status: "blocked" },
};

const DUE_OPTIONS: SheetOption[] = [
  { key: "any", label: "Any time" },
  { key: "overdue", label: "Overdue" },
  { key: "today", label: "Due today" },
  { key: "week", label: "Due this week" },
];

const Tasks: React.FC<TasksScreenProps> = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState<TaskFilter>("my-tasks");
  const [query, setQuery] = useState("");
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  const [myProjects, setMyProjects] = useState<ProjectModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("due-date");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [dueFilter, setDueFilter] = useState<string>("any");
  const [openSheet, setOpenSheet] = useState<"sort" | "project" | "due" | null>(
    null
  );

  useEffect(() => {
    const filter = route.params?.filter;
    if (filter) {
      setActiveTab(filter);
    }
  }, [route.params]);

  // Backs the project filter sheet — the API already scopes it to your projects.
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const response = await ProjectService.projectList();
        if (active) {
          setMyProjects((response?.data?.projects ?? []).map(mapApiProject));
        }
      } catch {
        // The filter sheet just stays at "All projects".
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      setError(null);
      const response = await TaskService.taskList({
        ...TAB_PARAMS[activeTab],
        ...SORT_PARAMS[sortKey],
        search: query.trim() || undefined,
        projectId: projectFilter === "all" ? undefined : projectFilter,
      });
      setTasks((response?.data?.tasks ?? []).map(mapApiTask));
    } catch (caught: any) {
      setError(caught?.message ?? "Couldn't load tasks.");
      setTasks([]);
    }
  }, [activeTab, sortKey, query, projectFilter]);

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

  const tabs: TabItem<TaskFilter>[] = [
    { key: "my-tasks", label: "My Tasks" },
    { key: "all", label: "All" },
    { key: "created", label: "Created" },
    { key: "in-progress", label: "In Progress" },
    { key: "pending-approval", label: "Pending Approval" },
    { key: "completed", label: "Completed" },
  ];

  // The due window has no server-side equivalent, so it stays a local filter.
  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (dueFilter === "any") {
          return true;
        }

        const days = daysUntil(task.dueDate);
        if (dueFilter === "overdue") {
          return days < 0 && task.status !== "completed";
        }
        if (dueFilter === "today") {
          return days === 0;
        }
        return days >= 0 && days <= 7;
      }),
    [tasks, dueFilter]
  );

  const activeFilterCount =
    (projectFilter === "all" ? 0 : 1) + (dueFilter === "any" ? 0 : 1);

  const projectOptions: SheetOption[] = [
    { key: "all", label: "All projects" },
    ...myProjects.map((project) => ({
      key: project.id,
      label: project.name,
      color: getAvatarColor(project.id),
      icon: "ellipse",
    })),
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const gotoTaskDetails = (task: TaskModel) =>
    navigation.navigate("TaskDetails", { taskId: task.id });

  const renderFilterPill = (
    label: string,
    isActive: boolean,
    onPress: () => void,
    icon: string
  ) => (
    <TouchableOpacity
      style={[styles.filterPill, isActive && styles.filterPillActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={14}
        color={isActive ? Colors.white : Colors.lightFont}
      />
      <Text
        style={[styles.filterPillText, isActive && styles.filterPillTextActive]}
      >
        {label}
      </Text>
      <Ionicons
        name="chevron-down"
        size={13}
        color={isActive ? Colors.white : Colors.mutedFont}
      />
    </TouchableOpacity>
  );

  return (
    <Container>
      <Header
        title="Tasks"
        right={
          <TouchableOpacity
            onPress={() => navigation.navigate("CreateTask")}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Create task"
          >
            <Ionicons name="add" size={26} color={Colors.primary} />
          </TouchableOpacity>
        }
      />
      <WhiteContainer style={styles.container}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search tasks"
          style={styles.search}
        />

        <SegmentedTabs
          tabs={tabs}
          activeKey={activeTab}
          onChange={setActiveTab}
          scrollable
          style={styles.tabs}
        />

        <View style={styles.filterRow}>
          {renderFilterPill(
            projectFilter === "all"
              ? "Project"
              : projectOptions.find((option) => option.key === projectFilter)
                  ?.label ?? "Project",
            projectFilter !== "all",
            () => setOpenSheet("project"),
            "folder-outline"
          )}
          {renderFilterPill(
            DUE_OPTIONS.find((option) => option.key === dueFilter)?.label ??
              "Due",
            dueFilter !== "any",
            () => setOpenSheet("due"),
            "calendar-outline"
          )}
          {renderFilterPill(
            SORT_OPTIONS.find((option) => option.key === sortKey)?.label ??
              "Sort",
            false,
            () => setOpenSheet("sort"),
            "swap-vertical-outline"
          )}
        </View>

        <View style={styles.resultRow}>
          <Text style={styles.resultCount}>
            {visibleTasks.length} task{visibleTasks.length === 1 ? "" : "s"}
          </Text>
          {activeFilterCount > 0 ? (
            <TouchableOpacity
              onPress={() => {
                setProjectFilter("all");
                setDueFilter("any");
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.clearFilters}>Clear filters</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <FlatList
          data={visibleTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard task={item} onPress={gotoTaskDetails} />
          )}
          contentContainerStyle={[
            styles.list,
            visibleTasks.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loading ? (
              <Loader size="large" />
            ) : (
              <EmptyState
                icon={error ? "cloud-offline-outline" : "checkbox-outline"}
                title={error ? "Couldn't load tasks" : "No tasks found"}
                subtitle={
                  error ?? "Adjust your filters or create a new task."
                }
                actionTitle={error ? undefined : "Create Task"}
                onActionPress={
                  error ? undefined : () => navigation.navigate("CreateTask")
                }
              />
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        />
      </WhiteContainer>

      <OptionSheet
        visible={openSheet === "project"}
        title="Filter by project"
        options={projectOptions}
        selectedKey={projectFilter}
        onSelect={(option) => {
          setProjectFilter(option.key);
          setOpenSheet(null);
        }}
        onClose={() => setOpenSheet(null)}
      />

      <OptionSheet
        visible={openSheet === "due"}
        title="Filter by due date"
        options={DUE_OPTIONS}
        selectedKey={dueFilter}
        onSelect={(option) => {
          setDueFilter(option.key);
          setOpenSheet(null);
        }}
        onClose={() => setOpenSheet(null)}
      />

      <OptionSheet
        visible={openSheet === "sort"}
        title="Sort tasks by"
        options={SORT_OPTIONS}
        selectedKey={sortKey}
        onSelect={(option) => {
          setSortKey(option.key as SortKey);
          setOpenSheet(null);
        }}
        onClose={() => setOpenSheet(null)}
      />
    </Container>
  );
};

export default Tasks;

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  search: {
    marginBottom: 14,
  },
  tabs: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    backgroundColor: Colors.white,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.lightFont,
    maxWidth: 96,
  },
  filterPillTextActive: {
    color: Colors.white,
    fontWeight: "600",
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  resultCount: {
    fontSize: 12,
    color: Colors.mutedFont,
    fontWeight: "500",
  },
  clearFilters: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600",
  },
  list: {
    paddingTop: 12,
    paddingBottom: 90,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
