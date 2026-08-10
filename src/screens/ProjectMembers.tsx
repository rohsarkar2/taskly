import React, { useMemo, useState } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  Container,
  EmptyState,
  Header,
  MemberRow,
  SearchBar,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import {
  getProjectById,
  getProjectMembers,
  getTasksByProjectId,
} from "../data";
import { UserModel, UserRole } from "../models/user";
import { ProjectMembersScreenProps } from "../navigation/NavigationTypes";
import { useAppSelector } from "../store/hooks";

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

  const project = getProjectById(projectId);
  const members = useMemo(() => getProjectMembers(projectId), [projectId]);
  const projectTasks = useMemo(
    () => getTasksByProjectId(projectId),
    [projectId]
  );

  // Leads and managers can drill into a member; team members only browse.
  const canOpenMember = user?.role === "team-lead" || user?.role === "manager";

  const sections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = members.filter(
      (member) =>
        !normalizedQuery ||
        member.name.toLowerCase().includes(normalizedQuery) ||
        member.jobTitle.toLowerCase().includes(normalizedQuery)
    );

    return ROLE_ORDER.map(({ role, title }) => ({
      title,
      data: filtered.filter((member) => member.role === role),
    })).filter((section) => section.data.length > 0);
  }, [members, query]);

  const openTaskCount = (memberId: string) =>
    projectTasks.filter(
      (task) => task.assigneeId === memberId && task.status !== "completed"
    ).length;

  const handleMemberPress = (member: UserModel) => {
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
          renderItem={({ item }) => {
            const openTasks = openTaskCount(item.id);

            return (
              <MemberRow
                member={item}
                subtitle={`${item.jobTitle} · ${openTasks} open task${
                  openTasks === 1 ? "" : "s"
                }`}
                onPress={canOpenMember ? handleMemberPress : undefined}
                showChevron={canOpenMember}
              />
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={[
            styles.list,
            sections.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="No members found"
              subtitle="Try a different search term."
            />
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
