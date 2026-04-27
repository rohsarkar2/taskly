import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Container, Header, WhiteContainer, Button } from "../components";
import { HomeScreenProps } from "../navigation/NavigationTypes";
import Colors from "../configs/Colors";

// Mock data for tasks
const mockTasks = [
  {
    id: "1",
    title: "Complete project proposal",
    description: "Prepare and submit the Q2 project proposal",
    dueDate: "2026-04-30",
    completed: false,
  },
  {
    id: "2",
    title: "Team meeting",
    description: "Weekly sync with the development team",
    dueDate: "2026-04-28",
    completed: false,
  },
  {
    id: "3",
    title: "Code review",
    description: "Review pull requests from team members",
    dueDate: "2026-04-27",
    completed: true,
  },
  {
    id: "4",
    title: "Update documentation",
    description: "Update API documentation with new endpoints",
    dueDate: "2026-04-26",
    completed: true,
  },
];

const Home: React.FC<HomeScreenProps> = (props: HomeScreenProps) => {
  // Mock authentication state - will be replaced with actual auth context
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tasks] = useState(mockTasks);

  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  const handleSignIn = () => {
    props.navigation.navigate("SignIn");
  };

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
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{pendingTasks.length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{completedTasks.length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{tasks.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Add Task Button */}
      <TouchableOpacity style={styles.addTaskButton}>
        <Ionicons name="add-circle" size={24} color={Colors.white} />
        <Text style={styles.addTaskButtonText}>Add New Task</Text>
      </TouchableOpacity>

      {/* Pending Tasks */}
      <View style={styles.taskSection}>
        <Text style={styles.taskSectionTitle}>Pending Tasks</Text>
        {pendingTasks.length > 0 ? (
          pendingTasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <TouchableOpacity style={styles.checkbox}>
                  <Ionicons
                    name="ellipse-outline"
                    size={24}
                    color={Colors.mutedFont}
                  />
                </TouchableOpacity>
                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskDescription}>{task.description}</Text>
                  <View style={styles.taskMeta}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color={Colors.mutedFont}
                    />
                    <Text style={styles.taskDate}>{task.dueDate}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.taskActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons
                    name="create-outline"
                    size={20}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={Colors.tertiary}
                  />
                </TouchableOpacity>
              </View>
            </View>
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
            <View
              key={task.id}
              style={[styles.taskCard, styles.completedTaskCard]}
            >
              <View style={styles.taskHeader}>
                <TouchableOpacity style={styles.checkbox}>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
                <View style={styles.taskContent}>
                  <Text style={[styles.taskTitle, styles.completedTaskTitle]}>
                    {task.title}
                  </Text>
                  <Text style={styles.taskDescription}>{task.description}</Text>
                  <View style={styles.taskMeta}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color={Colors.mutedFont}
                    />
                    <Text style={styles.taskDate}>{task.dueDate}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.taskActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={Colors.tertiary}
                  />
                </TouchableOpacity>
              </View>
            </View>
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
    paddingBottom: 80,
    // backgroundColor: Colors.lightBorder,
  },
  // Landing Page Styles
  landingContent: {
    // paddingBottom: 80,
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
    // paddingBottom: 40,
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.mutedFont,
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
  taskCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderGray,
  },
  completedTaskCard: {
    opacity: 0.7,
  },
  taskHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  checkbox: {
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 4,
  },
  completedTaskTitle: {
    textDecorationLine: "line-through",
    color: Colors.mutedFont,
  },
  taskDescription: {
    fontSize: 14,
    color: Colors.mutedFont,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskDate: {
    fontSize: 12,
    color: Colors.mutedFont,
    marginLeft: 4,
  },
  taskActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.mutedFont,
    textAlign: "center",
    paddingVertical: 20,
  },
});
