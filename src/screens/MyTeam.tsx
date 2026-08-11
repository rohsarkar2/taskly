import React, { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  Container,
  EmptyState,
  Header,
  MemberRow,
  SearchBar,
  SectionHeader,
  StatCard,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import { ProjectMemberModel } from "../models/project";
import { TaskModel } from "../models/task";
import { MyTeamScreenProps } from "../navigation/NavigationTypes";
import DashboardService from "../services/DashboardService";
import { useAppSelector } from "../store/hooks";
import { isOverdue } from "../utils/Formatters";
import { fetchTeamRoster, fetchTeamTasks } from "../utils/Team";

const MyTeam: React.FC<MyTeamScreenProps> = ({ navigation }) => {
  const user = useAppSelector((state) => state.user.userData);
  const [query, setQuery] = useState("");

  const [team, setTeam] = useState<ProjectMemberModel[]>([]);
  const [teamTasks, setTeamTasks] = useState<TaskModel[]>([]);
  const [approvalCount, setApprovalCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        const [roster, tasks] = await Promise.all([
          fetchTeamRoster(user?.id).catch(() => []),
          fetchTeamTasks().catch(() => []),
        ]);

        if (!active) return;
        setTeam(roster);
        setTeamTasks(tasks);

        try {
          const response = await DashboardService.getDashboard();
          if (active) {
            setApprovalCount(response?.data?.summary?.awaitingMyApproval ?? 0);
          }
        } catch {
          // The approvals tile just stays at zero.
        }
      })();

      return () => {
        active = false;
      };
    }, [user?.id]),
  );

  const teamStats = useMemo(
    () => ({
      open: teamTasks.filter((task) => task.status !== "completed").length,
      overdue: teamTasks.filter((task) =>
        isOverdue(task.dueDate, task.status)
      ).length,
    }),
    [teamTasks]
  );

  const visibleTeam = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return team.filter(
      (member) =>
        !normalizedQuery ||
        member.name.toLowerCase().includes(normalizedQuery) ||
        member.designation.toLowerCase().includes(normalizedQuery)
    );
  }, [team, query]);

  const openTaskCount = (memberId: string) =>
    teamTasks.filter(
      (task) => task.assignee?.id === memberId && task.status !== "completed"
    ).length;

  const handleMemberPress = (member: { id: string }) =>
    navigation.navigate("TeamMemberDetails", { userId: member.id });

  if (user?.role === "team-member") {
    return (
      <Container>
        <Header title="My Team" showBack />
        <WhiteContainer>
          <EmptyState
            icon="people-outline"
            title="Team views are for leads"
            subtitle="Team Leads and Managers see team workload and approvals here."
          />
        </WhiteContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header
        title={user?.role === "manager" ? "Team Overview" : "My Team"}
        showBack
      />
      <WhiteContainer style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Snapshot */}
          <View style={styles.statsRow}>
            <StatCard
              icon="people-outline"
              label="Members"
              value={team.length}
              color={Colors.primary}
            />
            <StatCard
              icon="checkbox-outline"
              label="Open Tasks"
              value={teamStats.open}
              color={Colors.statusInProgress}
              onPress={() => navigation.navigate("TeamTasks")}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              icon="shield-checkmark-outline"
              label="Approvals"
              value={approvalCount}
              color={Colors.warning}
              onPress={() => navigation.navigate("PendingApprovals")}
            />
            <StatCard
              icon="alert-circle-outline"
              label="Overdue"
              value={teamStats.overdue}
              color={Colors.danger}
              onPress={() => navigation.navigate("TeamTasks")}
            />
          </View>

          {/* Shortcuts */}
          <View style={styles.shortcuts}>
            <TouchableOpacity
              style={styles.shortcut}
              onPress={() => navigation.navigate("TeamTasks")}
              activeOpacity={0.7}
            >
              <Ionicons name="list-outline" size={18} color={Colors.primary} />
              <Text style={styles.shortcutText}>Team Tasks</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shortcut}
              onPress={() => navigation.navigate("TeamWorkload")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="bar-chart-outline"
                size={18}
                color={Colors.primary}
              />
              <Text style={styles.shortcutText}>Workload</Text>
            </TouchableOpacity>
          </View>

          {/* Members */}
          <SectionHeader title="Members" style={styles.sectionHeader} />
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search team"
            style={styles.search}
          />

          <View style={styles.memberList}>
            {visibleTeam.length > 0 ? (
              visibleTeam.map((member, index) => {
                const open = openTaskCount(member.id);

                return (
                  <View key={member.id}>
                    {index > 0 ? <View style={styles.divider} /> : null}
                    <MemberRow
                      member={{
                        id: member.id,
                        name: member.name,
                        role: member.role,
                        image: member.avatar,
                        jobTitle: member.designation,
                      }}
                      subtitle={`${member.designation} · ${open} open task${
                        open === 1 ? "" : "s"
                      }`}
                      onPress={handleMemberPress}
                      showChevron
                    />
                  </View>
                );
              })
            ) : (
              <EmptyState
                icon="people-outline"
                title="No members found"
                subtitle="Try a different search term."
              />
            )}
          </View>
        </ScrollView>
      </WhiteContainer>
    </Container>
  );
};

export default MyTeam;

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  content: {
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  shortcuts: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  shortcut: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingVertical: 13,
  },
  shortcutText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  sectionHeader: {
    marginTop: 28,
  },
  search: {
    marginBottom: 6,
  },
  memberList: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.leaderboardBorderVeryLight,
  },
});
