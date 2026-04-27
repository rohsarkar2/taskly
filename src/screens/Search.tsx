import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Container, Header, WhiteContainer } from "../components";
import { SearchScreenProps } from "../navigation/NavigationTypes";
import Colors from "../configs/Colors";

// Mock data for search results
const allTasks = [
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
  {
    id: "5",
    title: "Design mockups",
    description: "Create UI mockups for the new feature",
    dueDate: "2026-05-01",
    completed: false,
  },
];

const Search: React.FC<SearchScreenProps> = (props: SearchScreenProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "pending" | "completed"
  >("all");

  // Filter tasks based on search query and filter
  const filteredTasks = allTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "pending" && !task.completed) ||
      (selectedFilter === "completed" && task.completed);

    return matchesSearch && matchesFilter;
  });

  return (
    <Container>
      <Header title="Search Tasks" />
      <WhiteContainer style={styles.container}>
        {/* Search Input */}
        <View style={styles.searchSection}>
          <View style={styles.searchInputWrapper}>
            <Ionicons
              name="search"
              size={20}
              color={Colors.mutedFont}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tasks by title or description..."
              placeholderTextColor={Colors.mutedFont}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={Colors.mutedFont}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Tabs */}
          <View style={styles.filterTabs}>
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === "all" && styles.activeFilterTab,
              ]}
              onPress={() => setSelectedFilter("all")}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === "all" && styles.activeFilterTabText,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === "pending" && styles.activeFilterTab,
              ]}
              onPress={() => setSelectedFilter("pending")}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === "pending" && styles.activeFilterTabText,
                ]}
              >
                Pending
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === "completed" && styles.activeFilterTab,
              ]}
              onPress={() => setSelectedFilter("completed")}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === "completed" && styles.activeFilterTabText,
                ]}
              >
                Completed
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Results */}
        <ScrollView
          contentContainerStyle={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
        >
          {searchQuery.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={64}
                color={Colors.mutedFont}
              />
              <Text style={styles.emptyStateTitle}>Search for tasks</Text>
              <Text style={styles.emptyStateText}>
                Enter a keyword to find your tasks
              </Text>
            </View>
          ) : filteredTasks.length > 0 ? (
            <>
              <Text style={styles.resultsCount}>
                {filteredTasks.length}{" "}
                {filteredTasks.length === 1 ? "result" : "results"} found
              </Text>
              {filteredTasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskCard}
                  activeOpacity={0.7}
                >
                  <View style={styles.taskHeader}>
                    <View style={styles.checkbox}>
                      <Ionicons
                        name={
                          task.completed
                            ? "checkmark-circle"
                            : "ellipse-outline"
                        }
                        size={24}
                        color={
                          task.completed ? Colors.primary : Colors.mutedFont
                        }
                      />
                    </View>
                    <View style={styles.taskContent}>
                      <Text
                        style={[
                          styles.taskTitle,
                          task.completed && styles.completedTaskTitle,
                        ]}
                      >
                        {task.title}
                      </Text>
                      <Text style={styles.taskDescription}>
                        {task.description}
                      </Text>
                      <View style={styles.taskMeta}>
                        <Ionicons
                          name="calendar-outline"
                          size={14}
                          color={Colors.mutedFont}
                        />
                        <Text style={styles.taskDate}>{task.dueDate}</Text>
                        {task.completed && (
                          <>
                            <View style={styles.statusBadge}>
                              <Text style={styles.statusBadgeText}>
                                Completed
                              </Text>
                            </View>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="folder-open-outline"
                size={64}
                color={Colors.mutedFont}
              />
              <Text style={styles.emptyStateTitle}>No tasks found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search or filter
              </Text>
            </View>
          )}
        </ScrollView>
      </WhiteContainer>
    </Container>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  searchSection: {
    marginBottom: 20,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.black,
  },
  filterTabs: {
    flexDirection: "row",
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    alignItems: "center",
  },
  activeFilterTab: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.mutedFont,
  },
  activeFilterTabText: {
    color: Colors.white,
  },
  resultsContainer: {
    flexGrow: 1,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.mutedFont,
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
  taskHeader: {
    flexDirection: "row",
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
    marginRight: 8,
  },
  statusBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.primary,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    // justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.mutedFont,
    textAlign: "center",
  },
});
