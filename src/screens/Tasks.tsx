import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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

const Tasks: React.FC<TasksScreenProps> = (props: TasksScreenProps) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingTasks, setPendingTasks] = useState<TaskModel[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<TaskModel[]>([]);
  const [completedTasks, setCompletedTasks] = useState<TaskModel[]>([]);
  const [activeTab, setActiveTab] = useState<
    "pending" | "in-progress" | "completed"
  >("pending");

  useEffect(() => {
    const unsubscribe = props.navigation.addListener("focus", () => {
      fetchTasks();
    });

    return unsubscribe;
  }, [props.navigation]);

  const fetchTasks = async () => {
    setLoading(true);
    setActiveTab("pending");
    try {
      const response = await TaskService.taskList();
      const pendingTasks = response.tasks
        .filter((task: TaskModel) => task.status === "pending")
        .sort(
          (a: TaskModel, b: TaskModel) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
        );
      const inProgressTasks = response.tasks
        .filter((task: TaskModel) => task.status === "in-progress")
        .sort(
          (a: TaskModel, b: TaskModel) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
        );
      const completedTasks = response.tasks
        .filter((task: TaskModel) => task.status === "completed")
        .sort(
          (a: TaskModel, b: TaskModel) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
        );
      setPendingTasks(pendingTasks);
      setInProgressTasks(inProgressTasks);
      setCompletedTasks(completedTasks);
      setLoading(false);
    } catch (error) {
      setPendingTasks([]);
      setInProgressTasks([]);
      setCompletedTasks([]);
      setLoading(false);
    }
  };

  const handleTabChange = (tab: "pending" | "in-progress" | "completed") => {
    setActiveTab(tab);
  };

  const renderPendingTasks = () => {
    return (
      <>
        {loading ? (
          <Loader size="large" fullScreen />
        ) : pendingTasks.length === 0 ? (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ color: Colors.lightFont, fontSize: 16 }}>
              No pending tasks yet.
            </Text>
          </View>
        ) : (
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
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </>
    );
  };

  const renderInProgressTasks = () => {
    return (
      <>
        {loading ? (
          <Loader size="large" fullScreen />
        ) : inProgressTasks.length === 0 ? (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ color: Colors.lightFont, fontSize: 16 }}>
              No in-progress tasks yet.
            </Text>
          </View>
        ) : (
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
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </>
    );
  };

  const renderCompletedTasks = () => {
    return (
      <>
        {loading ? (
          <Loader size="large" fullScreen />
        ) : completedTasks.length === 0 ? (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ color: Colors.lightFont, fontSize: 16 }}>
              No completed tasks yet.
            </Text>
          </View>
        ) : (
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
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </>
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
});
