import React, { useEffect, useMemo, useState } from "react";
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
  OptionSheet,
  SearchBar,
  SegmentedTabs,
  TaskCard,
  WhiteContainer,
} from "../components";
import type { SheetOption, TabItem } from "../components";
import Colors from "../configs/Colors";
import { getProjectsForUser, tasks as allTasks } from "../data";
import { TaskModel, TaskPriority } from "../models/task";
import { TaskFilter, TasksScreenProps } from "../navigation/NavigationTypes";
import { useAppSelector } from "../store/hooks";
import { daysUntil } from "../utils/Formatters";

type SortKey = "due-date" | "priority" | "recent";

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const SORT_OPTIONS: SheetOption[] = [
  { key: "due-date", label: "Due date", icon: "calendar-outline" },
  { key: "priority", label: "Priority", icon: "flag-outline" },
  { key: "recent", label: "Recently updated", icon: "time-outline" },
];

const DUE_OPTIONS: SheetOption[] = [
  { key: "any", label: "Any time" },
  { key: "overdue", label: "Overdue" },
  { key: "today", label: "Due today" },
  { key: "week", label: "Due this week" },
];

const Tasks: React.FC<TasksScreenProps> = ({ navigation, route }) => {
  const user = useAppSelector((state) => state.user.userData);
  const [activeTab, setActiveTab] = useState<TaskFilter>("my-tasks");
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
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

  const myProjects = useMemo(
    () => (user ? getProjectsForUser(user.id) : []),
    [user]
  );

  // Only tasks inside projects the user belongs to.
  const visibleScope = useMemo(() => {
    const projectIds = new Set(myProjects.map((project) => project.id));
    return allTasks.filter((task) => projectIds.has(task.projectId));
  }, [myProjects]);

  const tabs: TabItem<TaskFilter>[] = [
    { key: "my-tasks", label: "My Tasks" },
    { key: "all", label: "All" },
    { key: "created", label: "Created" },
    { key: "in-progress", label: "In Progress" },
    { key: "pending-approval", label: "Pending Approval" },
    { key: "completed", label: "Completed" },
  ];

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const byTab = visibleScope.filter((task) => {
      switch (activeTab) {
        case "all":
          return true;
        case "my-tasks":
          return task.assigneeId === user?.id;
        case "created":
          return task.creatorId === user?.id;
        default:
          return task.status === activeTab;
      }
    });

    const byFilters = byTab.filter((task) => {
      if (projectFilter !== "all" && task.projectId !== projectFilter) {
        return false;
      }

      const days = daysUntil(task.dueDate);
      if (
        dueFilter === "overdue" &&
        (days >= 0 || task.status === "completed")
      ) {
        return false;
      }
      if (dueFilter === "today" && days !== 0) {
        return false;
      }
      if (dueFilter === "week" && (days < 0 || days > 7)) {
        return false;
      }

      if (
        normalizedQuery &&
        !task.title.toLowerCase().includes(normalizedQuery)
      ) {
        return false;
      }

      return true;
    });

    return [...byFilters].sort((a, b) => {
      if (sortKey === "priority") {
        return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
      }
      if (sortKey === "recent") {
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [visibleScope, activeTab, user, projectFilter, dueFilter, query, sortKey]);

  const activeFilterCount =
    (projectFilter === "all" ? 0 : 1) + (dueFilter === "any" ? 0 : 1);

  const projectOptions: SheetOption[] = [
    { key: "all", label: "All projects" },
    ...myProjects.map((project) => ({
      key: project.id,
      label: project.name,
      color: project.color,
      icon: "ellipse",
    })),
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
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
            {filteredTasks.length} task{filteredTasks.length === 1 ? "" : "s"}
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
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard task={item} onPress={gotoTaskDetails} />
          )}
          contentContainerStyle={[
            styles.list,
            filteredTasks.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="checkbox-outline"
              title="No tasks found"
              subtitle="Adjust your filters or create a new task."
              actionTitle="Create Task"
              onActionPress={() => navigation.navigate("CreateTask")}
            />
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
