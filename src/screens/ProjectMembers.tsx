import React, { useEffect, useMemo, useState } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  Container,
  EmptyState,
  Header,
  Loader,
  MemberRow,
  SearchBar,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import { ProjectMemberModel, ProjectModel } from "../models/project";
import { UserRole } from "../models/user";
import { ProjectMembersScreenProps } from "../navigation/NavigationTypes";
import ProjectService from "../services/ProjectService";
import { useAppSelector } from "../store/hooks";
import { mapApiProject, mapApiProjectMember } from "../utils/Mappers";

const ROLE_ORDER: { role: UserRole; title: string }[] = [
  { role: "manager", title: "Managers" },
  { role: "team-lead", title: "Team Leads" },
  { role: "team-member", title: "Team Members" },
];

const ProjectMembers: React.FC<ProjectMembersScreenProps> = ({
  navigation,
  route,
}) => {
  const { projectId } = route.params;
  const user = useAppSelector((state) => state.user.userData);
  const [query, setQuery] = useState("");

  const [project, setProject] = useState<ProjectModel | null>(null);
  const [members, setMembers] = useState<ProjectMemberModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [membersResponse, detailsResponse] = await Promise.all([
          ProjectService.getProjectMembers(projectId),
          ProjectService.getProjectDetails(projectId),
        ]);
        if (!active) return;

        setMembers(
          (membersResponse?.data?.members ?? []).map(mapApiProjectMember),
        );
        setProject(mapApiProject(detailsResponse?.data?.project));
      } catch (caught: any) {
        if (active) {
          setError(caught?.message ?? "Couldn't load the member list.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [projectId]);

  // Leads and managers can drill into a member; team members only browse.
  const canOpenMember = user?.role === "team-lead" || user?.role === "manager";

  // Search runs locally — the members endpoint takes no query parameters.
  const sections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = members.filter(
      (member) =>
        !normalizedQuery ||
        member.name.toLowerCase().includes(normalizedQuery) ||
        member.designation.toLowerCase().includes(normalizedQuery)
    );

    return ROLE_ORDER.map(({ role, title }) => ({
      title,
      data: filtered.filter((member) => member.role === role),
    })).filter((section) => section.data.length > 0);
  }, [members, query]);

  const handleMemberPress = (member: { id: string }) => {
    if (canOpenMember) {
      navigation.navigate("TeamMemberDetails", { userId: member.id });
    }
  };

  return (
    <Container>
      <Header title="Project Members" showBack />
      <WhiteContainer style={styles.container}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search members"
          style={styles.search}
        />

        {project ? (
          <View style={styles.summary}>
            <Ionicons name="people-outline" size={16} color={Colors.primary} />
            <Text style={styles.summaryText}>
              {members.length} people on {project.name}
            </Text>
          </View>
        ) : null}

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <MemberRow
              member={{
                id: item.id,
                name: item.name,
                role: item.role,
                image: item.avatar,
                jobTitle: item.designation,
              }}
              subtitle={item.designation || item.email}
              onPress={canOpenMember ? handleMemberPress : undefined}
              showChevron={canOpenMember}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={[
            styles.list,
            sections.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            loading ? (
              <Loader size="large" />
            ) : (
              <EmptyState
                icon={error ? "cloud-offline-outline" : undefined}
                title={error ? "Couldn't load members" : "No members found"}
                subtitle={error ?? "Try a different search term."}
              />
            )
          }
        />
      </WhiteContainer>
    </Container>
  );
};

export default ProjectMembers;

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  search: {
    marginBottom: 14,
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  summaryText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "500",
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.mutedFont,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 4,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.leaderboardBorderVeryLight,
  },
  list: {
    paddingTop: 4,
    paddingBottom: 40,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
