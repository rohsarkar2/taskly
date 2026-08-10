import React, { useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import {
  Container,
  EmptyState,
  Header,
  ProjectCard,
  SearchBar,
  SegmentedTabs,
  WhiteContainer,
} from "../components";
import type { TabItem } from "../components";
import Colors from "../configs/Colors";
import { getProjectsForUser } from "../data";
import { ProjectModel } from "../models/project";
import { ProjectsScreenProps } from "../navigation/NavigationTypes";
import { useAppSelector } from "../store/hooks";

type ProjectTab = "all" | "active" | "on-hold" | "completed";

const Projects: React.FC<ProjectsScreenProps> = ({ navigation }) => {
  const user = useAppSelector((state) => state.user.userData);
  const [activeTab, setActiveTab] = useState<ProjectTab>("all");
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Only projects the user is a member of ever reach the app.
  const myProjects = useMemo(
    () => (user ? getProjectsForUser(user.id) : []),
    [user]
  );

  const tabs: TabItem<ProjectTab>[] = [
    { key: "all", label: "All", count: myProjects.length },
    {
      key: "active",
      label: "Active",
      count: myProjects.filter((project) => project.status === "active").length,
    },
    {
      key: "on-hold",
      label: "On Hold",
      count: myProjects.filter((project) => project.status === "on-hold")
        .length,
    },
    {
      key: "completed",
      label: "Done",
      count: myProjects.filter((project) => project.status === "completed")
        .length,
    },
  ];

  const visibleProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return myProjects.filter((project) => {
      const matchesTab = activeTab === "all" || project.status === activeTab;
      const matchesQuery =
        !normalizedQuery ||
        project.name.toLowerCase().includes(normalizedQuery) ||
        project.description.toLowerCase().includes(normalizedQuery);

      return matchesTab && matchesQuery;
    });
  }, [myProjects, activeTab, query]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  const gotoProjectDetails = (project: ProjectModel) =>
    navigation.navigate("ProjectDetails", { projectId: project.id });

  return (
    <Container>
      <Header title="Projects" />
      <WhiteContainer style={styles.container}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search projects"
          style={styles.search}
        />

        <SegmentedTabs
          tabs={tabs}
          activeKey={activeTab}
          onChange={setActiveTab}
          scrollable
          style={styles.tabs}
        />

        <FlatList
          data={visibleProjects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProjectCard project={item} onPress={gotoProjectDetails} />
          )}
          contentContainerStyle={[
            styles.list,
            visibleProjects.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="folder-open-outline"
              title={query ? "No matching projects" : "No projects yet"}
              subtitle={
                query
                  ? "Try a different search term."
                  : "Projects you're added to will show up here."
              }
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
    </Container>
  );
};

export default Projects;

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
  list: {
    paddingTop: 16,
    paddingBottom: 90,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
