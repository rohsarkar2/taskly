import React, { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import {
  Container,
  EmptyState,
  Header,
  Loader,
  ProjectCard,
  SearchBar,
  SegmentedTabs,
  WhiteContainer,
} from "../components";
import type { TabItem } from "../components";
import Colors from "../configs/Colors";
import { ProjectModel } from "../models/project";
import { ProjectsScreenProps } from "../navigation/NavigationTypes";
import ProjectService from "../services/ProjectService";
import { mapApiProject } from "../utils/Mappers";

type ProjectTab = "all" | "active" | "on-hold" | "completed";

/** The tab keys are the app's; the API wants its own spelling. */
const API_PROJECT_STATUS: Record<Exclude<ProjectTab, "all">, string> = {
  active: "active",
  "on-hold": "on_hold",
  completed: "completed",
};

const Projects: React.FC<ProjectsScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<ProjectTab>("all");
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState<ProjectModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only projects the user is a member of ever reach the app — the API scopes
  // the list, so filtering and search run server side too.
  const loadProjects = useCallback(async () => {
    try {
      setError(null);
      const response = await ProjectService.projectList({
        search: query.trim() || undefined,
        status: activeTab === "all" ? undefined : API_PROJECT_STATUS[activeTab],
      });
      setProjects((response?.data?.projects ?? []).map(mapApiProject));
    } catch (caught: any) {
      setError(caught?.message ?? "Couldn't load your projects.");
      setProjects([]);
    }
  }, [activeTab, query]);

  useEffect(() => {
    let active = true;

    // Debounced so typing in the search bar doesn't fire a call per keystroke.
    const timer = setTimeout(async () => {
      await loadProjects();
      if (active) {
        setLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [loadProjects]);

  const tabs: TabItem<ProjectTab>[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "on-hold", label: "On Hold" },
    { key: "completed", label: "Done" },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
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
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProjectCard project={item} onPress={gotoProjectDetails} />
          )}
          contentContainerStyle={[
            styles.list,
            projects.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loading ? (
              <Loader size="large" />
            ) : (
              <EmptyState
                icon={error ? "cloud-offline-outline" : "folder-open-outline"}
                title={
                  error
                    ? "Couldn't load projects"
                    : query
                    ? "No matching projects"
                    : "No projects yet"
                }
                subtitle={
                  error ??
                  (query
                    ? "Try a different search term."
                    : "Projects you're added to will show up here.")
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
