import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  Avatar,
  Container,
  EmptyState,
  Header,
  ProgressBar,
  SectionHeader,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import { getTasksAssignedTo, getTeamMembersFor } from "../data";
import { TeamWorkloadScreenProps } from "../navigation/NavigationTypes";
import { useAppSelector } from "../store/hooks";
import { isOverdue } from "../utils/Formatters";

const TeamWorkload: React.FC<TeamWorkloadScreenProps> = ({ navigation }) => {
  const user = useAppSelector((state) => state.user.userData);

  const workload = useMemo(() => {
    if (!user) return [];

    return getTeamMembersFor(user)
      .map((member) => {
        const tasks = getTasksAssignedTo(member.id);
        const open = tasks.filter((task) => task.status !== "completed");

        return {
          member,
          total: tasks.length,
          open: open.length,
          overdue: tasks.filter((task) => isOverdue(task.dueDate, task.status))
            .length,
          awaiting: tasks.filter((task) => task.status === "pending-approval")
            .length,
        };
      })
      .sort((a, b) => b.open - a.open);
  }, [user]);

  // Scale each bar against the busiest person so the comparison is readable.
  const busiest = Math.max(1, ...workload.map((entry) => entry.open));

  const loadLabel = (open: number) => {
    if (open === 0) return { text: "Available", color: Colors.success };
    if (open <= 2) return { text: "Balanced", color: Colors.statusInProgress };
    if (open <= 4) return { text: "Busy", color: Colors.warning };
    return { text: "Overloaded", color: Colors.danger };
  };

  if (workload.length === 0) {
    return (
      <Container>
        <Header title="Team Workload" showBack />
        <WhiteContainer>
          <EmptyState
            icon="bar-chart-outline"
            title="No team to show"
            subtitle="Workload views are available to Team Leads and Managers."
          />
        </WhiteContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header title="Team Workload" showBack />
      <WhiteContainer style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summary}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={Colors.primary}
            />
            <Text style={styles.summaryText}>
              Open tasks per person, busiest first.
            </Text>
          </View>

          <SectionHeader title="Distribution" style={styles.sectionHeader} />

          {workload.map((entry) => {
            const load = loadLabel(entry.open);

            return (
              <TouchableOpacity
                key={entry.member.id}
                style={styles.card}
                onPress={() =>
                  navigation.navigate("TeamMemberDetails", {
                    userId: entry.member.id,
                  })
                }
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <Avatar
                    name={entry.member.name}
                    image={entry.member.image}
                    size={38}
                  />
                  <View style={styles.cardHeaderText}>
                    <Text style={styles.memberName}>{entry.member.name}</Text>
                    <Text style={styles.memberRole}>
                      {entry.member.jobTitle}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.loadPill,
                      { backgroundColor: `${load.color}1A` },
                    ]}
                  >
                    <Text style={[styles.loadText, { color: load.color }]}>
                      {load.text}
                    </Text>
                  </View>
                </View>

                <View style={styles.barRow}>
                  <ProgressBar
                    progress={(entry.open / busiest) * 100}
                    color={load.color}
                    height={8}
                    style={styles.bar}
                  />
                  <Text style={styles.barValue}>{entry.open}</Text>
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="albums-outline"
                      size={13}
                      color={Colors.lightFont}
                    />
                    <Text style={styles.metaText}>{entry.total} total</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="hourglass-outline"
                      size={13}
                      color={Colors.lightFont}
                    />
                    <Text style={styles.metaText}>
                      {entry.awaiting} awaiting
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={13}
                      color={
                        entry.overdue > 0 ? Colors.danger : Colors.lightFont
                      }
                    />
                    <Text
                      style={[
                        styles.metaText,
                        entry.overdue > 0 && styles.metaOverdue,
                      ]}
                    >
                      {entry.overdue} overdue
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </WhiteContainer>
    </Container>
  );
};

export default TeamWorkload;

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  content: {
    paddingBottom: 40,
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
    marginTop: 24,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
  },
  memberRole: {
    fontSize: 12,
    color: Colors.mutedFont,
    marginTop: 2,
  },
  loadPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  loadText: {
    fontSize: 11,
    fontWeight: "700",
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },
  bar: {
    flex: 1,
  },
  barValue: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.black,
    minWidth: 18,
    textAlign: "right",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: Colors.lightFont,
  },
  metaOverdue: {
    color: Colors.danger,
    fontWeight: "600",
  },
});
