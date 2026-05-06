import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  Container,
  Header,
  WhiteContainer,
  Button,
  TaskCard,
} from "../components";
import { HomeScreenProps } from "../navigation/NavigationTypes";
import Colors from "../configs/Colors";
import { useAppSelector } from "../store/hooks";
import { TaskModel } from "../models/task";
import TaskService from "../services/TaskService";

const Home: React.FC<HomeScreenProps> = (props: HomeScreenProps) => {
  // Mock authentication state - will be replaced with actual auth context
  const user = useAppSelector((state) => state.user.userData);
  const isAuthenticated = !!user;
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  const [loading, setLoading] = useState(false);

  // const pendingTasks = tasks?.filter((task) => !task.completed) || [];
  // const completedTasks = tasks?.filter((task) => task.completed) || [];

  useEffect(() => {
    const unsubscribe = props.navigation.addListener("focus", () => {
      if (isAuthenticated) {
        fetchTasks();
      } else {
        setTasks([]);
      }
    });

    return unsubscribe;
  }, [props.navigation, isAuthenticated]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await TaskService.taskList();
      setTasks(response.tasks);
      setLoading(false);
    } catch (error: any) {
      setTasks([]);
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    props.navigation.navigate("SignIn");
  };

  const pendingTasks = tasks?.filter((task) => task.status === "pending") || [];
  console.log(pendingTasks);
  const completedTasks =
    tasks?.filter((task) => task.status === "completed") || [];

  // Landing page for non-authenticated users
  const renderLandingPage = () => (
    <ScrollView
      contentContainerStyle={styles.landingContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroIcon}>
          <Ionicons name="checkmark-done" size={48} color={Colors.white} />
        </View>
        <Text style={styles.heroTitle}>Welcome to Taskly</Text>
        <Text style={styles.heroSubtitle}>
          Your simple and powerful task manager
        </Text>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Why Taskly?</Text>

        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons name="list" size={24} color={Colors.primary} />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Organize Your Tasks</Text>
            <Text style={styles.featureDescription}>
              Create, edit, and manage your daily tasks with ease
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons name="time" size={24} color={Colors.primary} />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Track Deadlines</Text>
            <Text style={styles.featureDescription}>
              Set due dates and never miss important deadlines
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={Colors.primary}
            />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Mark Complete</Text>
            <Text style={styles.featureDescription}>
              Track your progress with completed and pending tasks
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons name="search" size={24} color={Colors.primary} />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Quick Search</Text>
            <Text style={styles.featureDescription}>
              Find any task instantly with powerful search
            </Text>
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Button
          title="Get Started"
          onPress={handleSignIn}
          style={[styles.ctaButton]}
        />
        <Text style={styles.ctaText}>
          Start organizing your tasks today and boost your productivity!
        </Text>
      </View>
    </ScrollView>
  );

  // Dashboard for authenticated users
  const renderDashboard = () => (
    <ScrollView
      contentContainerStyle={styles.dashboardContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.primaryStatCard]}>
            <View style={styles.statCardHeader}>
              <View style={styles.statIconWrapper}>
                <Ionicons name="hourglass-outline" size={22} color="#FF6B35" />
              </View>
              <Text style={styles.statTrend}>●</Text>
            </View>
            <Text style={styles.statValue}>{pendingTasks.length}</Text>
            <Text style={styles.statTitle}>Pending</Text>
            <View style={styles.statProgress}>
              <View
                style={[
                  styles.statProgressBar,
                  {
                    width: `${
                      tasks.length > 0
                        ? (pendingTasks.length / tasks.length) * 100
                        : 0
                    }%`,
                    backgroundColor: "#FF6B35",
                  },
                ]}
              />
            </View>
          </View>

          <View style={[styles.statCard, styles.primaryStatCard]}>
            <View style={styles.statCardHeader}>
              <View style={styles.statIconWrapper}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={22}
                  color="#00B894"
                />
              </View>
              <Text style={[styles.statTrend, { color: "#00B894" }]}>●</Text>
            </View>
            <Text style={styles.statValue}>{completedTasks.length}</Text>
            <Text style={styles.statTitle}>Completed</Text>
            <View style={styles.statProgress}>
              <View
                style={[
                  styles.statProgressBar,
                  {
                    width: `${
                      tasks.length > 0
                        ? (completedTasks.length / tasks.length) * 100
                        : 0
                    }%`,
                    backgroundColor: "#00B894",
                  },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.totalStatCard}>
          <View style={styles.totalStatContent}>
            <View style={styles.totalStatLeft}>
              <Text style={styles.totalStatLabel}>Total Tasks</Text>
              <Text style={styles.totalStatValue}>{tasks?.length || 0}</Text>
            </View>
            {/* <View style={styles.totalStatRight}>
              <View style={styles.totalStatIconBg}>
                <Ionicons
                  name="bar-chart-outline"
                  size={28}
                  color={Colors.primary}
                />
              </View>
            </View> */}
          </View>
          <View style={styles.totalStatDivider} />
          <View style={styles.totalStatFooter}>
            <View style={styles.totalStatItem}>
              <Ionicons name="trending-up" size={14} color="#00B894" />
              <Text style={styles.totalStatItemText}>
                {tasks.length > 0
                  ? Math.round((completedTasks.length / tasks.length) * 100)
                  : 0}
                % Done
              </Text>
            </View>
            <View style={styles.totalStatItem}>
              <Ionicons name="time-outline" size={14} color="#636E72" />
              <Text style={styles.totalStatItemText}>Updated now</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Add Task Button */}
      <TouchableOpacity style={styles.addTaskButton} activeOpacity={0.7}>
        <Ionicons name="add-circle" size={24} color={Colors.white} />
        <Text style={styles.addTaskButtonText}>Add New Task</Text>
      </TouchableOpacity>

      {/* Pending Tasks */}
      <View style={styles.taskSection}>
        <Text style={styles.taskSectionTitle}>Pending Tasks</Text>
        {pendingTasks.length > 0 ? (
          pendingTasks.map((task) => (
            <TaskCard
              key={task.id}
              id={task.id}
              title={task.title}
              description={task.description}
              dueDate={task.dueDate}
              status="pending"
              onPress={(id) => console.log("View task:", id)}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No pending tasks</Text>
        )}
      </View>

      {/* Completed Tasks */}
      <View style={styles.taskSection}>
        <Text style={styles.taskSectionTitle}>Completed Tasks</Text>
        {completedTasks.length > 0 ? (
          completedTasks.map((task) => (
            <TaskCard
              key={task.id}
              id={task.id}
              title={task.title}
              description={task.description}
              dueDate={task.dueDate}
              status="completed"
              onPress={(id) => console.log("View task:", id)}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No completed tasks</Text>
        )}
      </View>
    </ScrollView>
  );

  return (
    <Container>
      <Header title="Taskly" showLogo />
      <WhiteContainer style={styles.container}>
        {isAuthenticated ? renderDashboard() : renderLandingPage()}
      </WhiteContainer>
    </Container>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    paddingHorizontal: 16,
  },
  // Landing Page Styles
  landingContent: {
    paddingBottom: 80,
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  heroIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 8,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.mutedFont,
    textAlign: "center",
  },
  featuresSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    marginBottom: 24,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.mutedFont,
    lineHeight: 20,
  },
  ctaSection: {
    // marginTop: 32,
    alignItems: "center",
  },
  ctaButton: {
    width: "100%",
    marginBottom: 16,
  },
  ctaText: {
    fontSize: 14,
    color: Colors.mutedFont,
    textAlign: "center",
    paddingHorizontal: 20,
  },

  // Dashboard Styles
  dashboardContent: {
    paddingTop: 20,
    paddingBottom: 80,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  primaryStatCard: {
    backgroundColor: "#FFFFFF",
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
  },
  statTrend: {
    fontSize: 18,
    color: "#FF6B35",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#2D3436",
    marginBottom: 4,
    letterSpacing: -1,
  },
  statTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#636E72",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statProgress: {
    height: 4,
    backgroundColor: "#F0F0F0",
    borderRadius: 2,
    overflow: "hidden",
  },
  statProgressBar: {
    height: "100%",
    borderRadius: 2,
  },
  totalStatCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  totalStatContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalStatLeft: {
    flex: 1,
  },
  totalStatLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#636E72",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalStatValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#2D3436",
    letterSpacing: -1,
  },
  totalStatRight: {
    marginLeft: 16,
  },
  totalStatIconBg: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  totalStatDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 12,
  },
  totalStatFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalStatItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalStatItemText: {
    fontSize: 12,
    color: "#636E72",
    marginLeft: 6,
    fontWeight: "500",
  },
  addTaskButton: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  addTaskButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
    marginLeft: 8,
  },
  taskSection: {
    marginBottom: 24,
  },
  taskSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.mutedFont,
    textAlign: "center",
    paddingVertical: 20,
  },
});
