import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { TasksScreenProps } from "../navigation/NavigationTypes";
import {
  Container,
  Header,
  Loader,
  TaskCard,
  WhiteContainer,
} from "../components";
import { TaskModel } from "../models/task";
import Colors from "../configs/Colors";
import TaskService from "../services/TaskService";
import Ionicons from "react-native-vector-icons/Ionicons";

const Tasks: React.FC<TasksScreenProps> = (props: TasksScreenProps) => {
  const LIMIT = 10;

  // Separate state for pending tasks
  const [pendingTasks, setPendingTasks] = useState<TaskModel[]>([]);
  const [pendingTasksLoading, setPendingTasksLoading] = useState(true);
  const [pendingTasksPage, setPendingTasksPage] = useState(1);
  const [pendingTasksHasMore, setPendingTasksHasMore] = useState(true);
  const [pendingTasksRefreshing, setPendingTasksRefreshing] = useState(false);
  const [pendingTasksLoadingMore, setPendingTasksLoadingMore] = useState(false);

  // Separate states for in-progress tasks
  const [inProgressTasks, setInProgressTasks] = useState<TaskModel[]>([]);
  const [inProgressTasksLoading, setInProgressTasksLoading] = useState(true);
  const [inProgressTasksPage, setInProgressTasksPage] = useState(1);
  const [inProgressTasksHasMore, setInProgressTasksHasMore] = useState(true);
  const [inProgressTasksRefreshing, setInProgressTasksRefreshing] =
    useState(false);
  const [inProgressTasksLoadingMore, setInProgressTasksLoadingMore] =
    useState(false);

  // Separate states for completed tasks
  const [completedTasks, setCompletedTasks] = useState<TaskModel[]>([]);
  const [completedTasksLoading, setCompletedTasksLoading] = useState(true);
  const [completedTasksPage, setCompletedTasksPage] = useState(1);
  const [completedTasksHasMore, setCompletedTasksHasMore] = useState(true);
  const [completedTasksRefreshing, setCompletedTasksRefreshing] =
    useState(false);
  const [completedTasksLoadingMore, setCompletedTasksLoadingMore] =
    useState(false);

  const [activeTab, setActiveTab] = useState<
    "pending" | "in-progress" | "completed"
  >("pending");

  useEffect(() => {
    const unsubscribe = props.navigation.addListener("focus", () => {
      refreshAllTasks();
    });

    return unsubscribe;
  }, [props.navigation]);

  useEffect(() => {
    fetchPendingTasks(1, false);
    fetchInProgressTasks(1, false);
    fetchCompletedTasks(1, false);
  }, []);

  // Fetch Pending Tasks
  const fetchPendingTasks = async (page: number, loadMore: boolean) => {
    if (loadMore) {
      if (!pendingTasksHasMore || pendingTasksLoadingMore) return;
      setPendingTasksLoadingMore(true);
    } else {
      setPendingTasksLoading(true);
    }

    try {
      const response = await TaskService.taskList(page, LIMIT, "pending");
      const newTasks = response.tasks || [];
      const pagination = response.pagination;

      if (loadMore) {
        setPendingTasks((prev) => [...prev, ...newTasks]);
      } else {
        setPendingTasks(newTasks);
      }

      setPendingTasksPage(page);
      setPendingTasksHasMore(pagination.currentPage < pagination.totalPages);
    } catch (error) {
      console.error("Error fetching pending tasks:", error);
      if (!loadMore) {
        setPendingTasks([]);
      }
    } finally {
      setPendingTasksLoading(false);
      setPendingTasksLoadingMore(false);
      setPendingTasksRefreshing(false);
    }
  };

  // Fetch In-Progress Tasks
  const fetchInProgressTasks = async (page: number, loadMore: boolean) => {
    if (loadMore) {
      if (!inProgressTasksHasMore || inProgressTasksLoadingMore) return;
      setInProgressTasksLoadingMore(true);
    } else {
      setInProgressTasksLoading(true);
    }

    try {
      const response = await TaskService.taskList(page, LIMIT, "in-progress");
      const newTasks = response.tasks || [];
      const pagination = response.pagination;

      if (loadMore) {
        setInProgressTasks((prev) => [...prev, ...newTasks]);
      } else {
        setInProgressTasks(newTasks);
      }

      setInProgressTasksPage(page);
      setInProgressTasksHasMore(pagination.currentPage < pagination.totalPages);
    } catch (error) {
      console.error("Error fetching in-progress tasks:", error);
      if (!loadMore) {
        setInProgressTasks([]);
      }
    } finally {
      setInProgressTasksLoading(false);
      setInProgressTasksLoadingMore(false);
      setInProgressTasksRefreshing(false);
    }
  };

  // Fetch Completed Tasks
  const fetchCompletedTasks = async (page: number, loadMore: boolean) => {
    if (loadMore) {
      if (!completedTasksHasMore || completedTasksLoadingMore) return;
      setCompletedTasksLoadingMore(true);
    } else {
      setCompletedTasksLoading(true);
    }

    try {
      const response = await TaskService.taskList(page, LIMIT, "completed");
      const newTasks = response.tasks || [];
      const pagination = response.pagination;

      if (loadMore) {
        setCompletedTasks((prev) => [...prev, ...newTasks]);
      } else {
        setCompletedTasks(newTasks);
      }

      setCompletedTasksPage(page);
      setCompletedTasksHasMore(pagination.currentPage < pagination.totalPages);
    } catch (error) {
      console.error("Error fetching completed tasks:", error);
      if (!loadMore) {
        setCompletedTasks([]);
      }
    } finally {
      setCompletedTasksLoading(false);
      setCompletedTasksLoadingMore(false);
      setCompletedTasksRefreshing(false);
    }
  };

  // Refresh all tasks
  const refreshAllTasks = () => {
    fetchPendingTasks(1, false);
    fetchInProgressTasks(1, false);
    fetchCompletedTasks(1, false);
  };

  // Load more handlers
  const handleLoadMorePending = () => {
    if (pendingTasksHasMore && !pendingTasksLoadingMore) {
      fetchPendingTasks(pendingTasksPage + 1, true);
    }
  };

  const handleLoadMoreInProgress = () => {
    if (inProgressTasksHasMore && !inProgressTasksLoadingMore) {
      fetchInProgressTasks(inProgressTasksPage + 1, true);
    }
  };

  const handleLoadMoreCompleted = () => {
    if (completedTasksHasMore && !completedTasksLoadingMore) {
      fetchCompletedTasks(completedTasksPage + 1, true);
    }
  };

  // Refresh handlers
  const handleRefreshPending = () => {
    setPendingTasksRefreshing(true);
    fetchPendingTasks(1, false);
  };

  const handleRefreshInProgress = () => {
    setInProgressTasksRefreshing(true);
    fetchInProgressTasks(1, false);
  };

  const handleRefreshCompleted = () => {
    setCompletedTasksRefreshing(true);
    fetchCompletedTasks(1, false);
  };

  const handleTabChange = (tab: "pending" | "in-progress" | "completed") => {
    setActiveTab(tab);
  };

  // Empty state component
  const EmptyState = ({
    icon,
    title,
    subtitle,
  }: {
    icon: string;
    title: string;
    subtitle: string;
  }) => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name={icon as any} size={64} color={Colors.borderGray} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );

  // Footer loading indicator
  const FooterLoader = () => (
    <View style={styles.footerLoader}>
      <Loader size="small" color={Colors.primary} />
      <Text style={styles.footerLoaderText}>Loading more...</Text>
    </View>
  );

  const renderPendingTasks = () => {
    if (pendingTasksLoading) {
      return <Loader size="large" fullScreen />;
    }

    return (
      <FlatList
        data={pendingTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TaskCard
            id={item.id}
            title={item.title}
            description={item.description}
            dueDate={item.dueDate}
            status="pending"
            onPress={(id) => console.log("View task:", id)}
          />
        )}
        contentContainerStyle={[
          styles.listContainer,
          pendingTasks.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="hourglass-outline"
            title="No pending tasks"
            subtitle="All caught up! Create a new task to get started."
          />
        }
        onEndReached={handleLoadMorePending}
        onEndReachedThreshold={0.5}
        ListFooterComponent={pendingTasksLoadingMore ? <FooterLoader /> : null}
        refreshControl={
          <RefreshControl
            refreshing={pendingTasksRefreshing}
            onRefresh={handleRefreshPending}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      />
    );
  };

  const renderInProgressTasks = () => {
    if (inProgressTasksLoading) {
      return <Loader size="large" fullScreen />;
    }

    return (
      <FlatList
        data={inProgressTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TaskCard
            id={item.id}
            title={item.title}
            description={item.description}
            dueDate={item.dueDate}
            status="in-progress"
            onPress={(id) => console.log("View task:", id)}
          />
        )}
        contentContainerStyle={[
          styles.listContainer,
          inProgressTasks.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="time-outline"
            title="No tasks in progress"
            subtitle="Move pending tasks here when you start working on them."
          />
        }
        onEndReached={handleLoadMoreInProgress}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          inProgressTasksLoadingMore ? <FooterLoader /> : null
        }
        refreshControl={
          <RefreshControl
            refreshing={inProgressTasksRefreshing}
            onRefresh={handleRefreshInProgress}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      />
    );
  };

  const renderCompletedTasks = () => {
    if (completedTasksLoading) {
      return <Loader size="large" fullScreen />;
    }

    return (
      <FlatList
        data={completedTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TaskCard
            id={item.id}
            title={item.title}
            description={item.description}
            dueDate={item.dueDate}
            status="completed"
            onPress={(id) => console.log("View task:", id)}
          />
        )}
        contentContainerStyle={[
          styles.listContainer,
          completedTasks.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="checkmark-circle-outline"
            title="No completed tasks"
            subtitle="Complete your tasks and they'll appear here."
          />
        }
        onEndReached={handleLoadMoreCompleted}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          completedTasksLoadingMore ? <FooterLoader /> : null
        }
        refreshControl={
          <RefreshControl
            refreshing={completedTasksRefreshing}
            onRefresh={handleRefreshCompleted}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      />
    );
  };

  const renderTabContent = () => {
    return (
      <View style={{ flex: 1 }}>
        {activeTab === "pending" && renderPendingTasks()}
        {activeTab === "in-progress" && renderInProgressTasks()}
        {activeTab === "completed" && renderCompletedTasks()}
      </View>
    );
  };

  return (
    <Container>
      <Header title="All Tasks" />
      <WhiteContainer style={styles.conatiner}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "pending" && styles.activeTabButton,
            ]}
            onPress={() => handleTabChange("pending")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "pending" && styles.activeTabText,
              ]}
            >
              Pending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "in-progress" && styles.activeTabButton,
            ]}
            onPress={() => handleTabChange("in-progress")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "in-progress" && styles.activeTabText,
              ]}
            >
              In Progress
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "completed" && styles.activeTabButton,
            ]}
            onPress={() => handleTabChange("completed")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "completed" && styles.activeTabText,
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </WhiteContainer>
    </Container>
  );
};

export default Tasks;

const styles = StyleSheet.create({
  conatiner: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingTop: 0,
    marginBottom: 0,
    marginHorizontal: -16,
  },
  tabButton: {
    flex: 1,
    paddingBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  listContainer: {
    paddingVertical: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.mutedFont,
    textAlign: "center",
    lineHeight: 20,
  },
  footerLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 8,
  },
  footerLoaderText: {
    fontSize: 14,
    color: Colors.mutedFont,
    marginLeft: 8,
  },
});
