import React, { useEffect, useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  Avatar,
  Badge,
  Container,
  EmptyState,
  Header,
  Loader,
  ProgressBar,
  SectionHeader,
  StatCard,
  TaskCard,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import { ProjectMemberModel, ProjectModel } from "../models/project";
import { TaskModel } from "../models/task";
import { TeamMemberDetailsScreenProps } from "../navigation/NavigationTypes";
import ProjectService from "../services/ProjectService";
import {
  getAvatarColor,
  getUserRoleMeta,
  isOverdue,
} from "../utils/Formatters";
import { mapApiProject, mapApiProjectMember } from "../utils/Mappers";
import { fetchTeamTasks } from "../utils/Team";

const TeamMemberDetails: React.FC<TeamMemberDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { userId } = route.params;

  const [member, setMember] = useState<ProjectMemberModel | null>(null);
  const [projects, setProjects] = useState<ProjectModel[]>([]);
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  const [loading, setLoading] = useState(true);

  // There is no per-user endpoint, so the person and the projects they share
  // with you are pulled out of the project member lists.
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const response = await ProjectService.projectList();
        const allProjects = (response?.data?.projects ?? []).map(mapApiProject);

        const rosters = await Promise.all(
          allProjects.map(async (project: ProjectModel) => {
            const members = await ProjectService.getProjectMembers(
              project.id,
            ).catch(() => null);

            return {
              project,
              members: (members?.data?.members ?? []).map(mapApiProjectMember),
            };
          }),
        );

        if (!active) return;

        const shared = rosters.filter((entry) =>
          entry.members.some((person: ProjectMemberModel) => person.id === userId),
        );

        setMember(
          shared[0]?.members.find(
            (person: ProjectMemberModel) => person.id === userId,
          ) ?? null,
        );
        setProjects(shared.map((entry) => entry.project));
        setTasks(
          (await fetchTeamTasks().catch(() => [])).filter(
            (task) => task.assignee?.id === userId,
          ),
        );
      } catch {
        // The empty state covers it.
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  if (loading) {
    return (
      <Container>
        <Header title="Team Member" showBack />
        <WhiteContainer>
          <Loader style={styles.screenLoader} size="large" />
        </WhiteContainer>
      </Container>
    );
  }

  if (!member) {
    return (
      <Container>
        <Header title="Team Member" showBack />
        <WhiteContainer>
          <EmptyState
            icon="person-outline"
            title="Member not found"
            subtitle="They may have left the organization."
          />
        </WhiteContainer>
      </Container>
    );
  }

  const completed = tasks.filter((task) => task.status === "completed");
  const open = tasks.filter((task) => task.status !== "completed");
  const overdue = tasks.filter((task) => isOverdue(task.dueDate, task.status));
  const completionRate = tasks.length
    ? Math.round((completed.length / tasks.length) * 100)
    : 0;

  return (
    <Container>
      <Header title="Team Member" showBack />
      <WhiteContainer style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Identity */}
          <View style={styles.identity}>
            <Avatar name={member.name} image={member.avatar} size={76} />
            <Text style={styles.name}>{member.name}</Text>
            <Text style={styles.jobTitle}>{member.designation}</Text>
            <View style={styles.badges}>
              <Badge meta={getUserRoleMeta(member.role)} size="small" />
            </View>
          </View>

          {/* Contact */}
          <View style={styles.contactRow}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => Linking.openURL(`mailto:${member.email}`)}
              activeOpacity={0.7}
            >
              <Ionicons name="mail-outline" size={17} color={Colors.primary} />
              <Text style={styles.contactText}>Email</Text>
            </TouchableOpacity>
          </View>

          {/* Workload */}
          <SectionHeader title="Workload" style={styles.sectionHeader} />
          <View style={styles.statsRow}>
            <StatCard
              icon="checkbox-outline"
              label="Open"
              value={open.length}
              color={Colors.statusInProgress}
            />
            <StatCard
              icon="checkmark-circle-outline"
              label="Completed"
              value={completed.length}
              color={Colors.success}
            />
            <StatCard
              icon="alert-circle-outline"
              label="Overdue"
              value={overdue.length}
              color={Colors.danger}
            />
          </View>

          <View style={styles.rateCard}>
            <View style={styles.rateHeader}>
              <Text style={styles.rateLabel}>Completion rate</Text>
              <Text style={styles.rateValue}>{completionRate}%</Text>
            </View>
            <ProgressBar progress={completionRate} />
          </View>

          {/* Projects */}
          <SectionHeader title="Projects" style={styles.sectionHeader} />
          <View style={styles.projectsCard}>
            {projects.length > 0 ? (
              projects.map((project, index) => (
                <TouchableOpacity
                  key={project.id}
                  style={[styles.projectRow, index > 0 && styles.projectRowGap]}
                  onPress={() =>
                    navigation.navigate("ProjectDetails", {
                      projectId: project.id,
                    })
                  }
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.projectDot,
                      { backgroundColor: getAvatarColor(project.id) },
                    ]}
                  />
                  <Text style={styles.projectName} numberOfLines={1}>
                    {project.name}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={Colors.mutedFont}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.empty}>Not on any projects yet.</Text>
            )}
          </View>

          {/* Assigned tasks */}
          <SectionHeader
            title={`Assigned Tasks (${open.length})`}
            style={styles.sectionHeader}
          />
          {open.length > 0 ? (
            open.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                showAssignee={false}
                onPress={() =>
                  navigation.navigate("TaskDetails", { taskId: task.id })
                }
              />
            ))
          ) : (
            <Text style={styles.empty}>No open tasks right now.</Text>
          )}
        </ScrollView>
      </WhiteContainer>
    </Container>
  );
};

export default TeamMemberDetails;

const styles = StyleSheet.create({
  screenLoader: {
    flex: 1,
  },
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  content: {
    paddingBottom: 40,
  },
  identity: {
    alignItems: "center",
    paddingVertical: 8,
  },
  name: {
    fontSize: 19,
    fontWeight: "700",
    color: Colors.black,
    marginTop: 12,
  },
  jobTitle: {
    fontSize: 13,
    color: Colors.mutedFont,
    marginTop: 4,
  },
  badges: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  contactRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingVertical: 12,
  },
  contactText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  joined: {
    fontSize: 12,
    color: Colors.mutedFont,
    textAlign: "center",
    marginTop: 12,
  },
  sectionHeader: {
    marginTop: 28,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  rateCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    padding: 16,
    marginTop: 12,
  },
  rateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  rateLabel: {
    fontSize: 13,
    color: Colors.lightFont,
    fontWeight: "500",
  },
  rateValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
  },
  projectsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    padding: 14,
  },
  projectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  projectRowGap: {
    marginTop: 16,
  },
  projectDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  projectName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: Colors.black,
  },
  empty: {
    fontSize: 13,
    color: Colors.mutedFont,
    textAlign: "center",
    paddingVertical: 16,
  },
});
