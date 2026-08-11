import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  Container,
  Header,
  Loader,
  ProgressBar,
  SectionHeader,
  StatCard,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import {
  DashboardSummaryModel,
  WorkloadEntryModel,
} from "../models/dashboard";
import { MyPerformanceScreenProps } from "../navigation/NavigationTypes";
import DashboardService from "../services/DashboardService";
import { getAvatarColor } from "../utils/Formatters";
import { mapDashboardSummary, mapWorkloadEntry } from "../utils/Mappers";

const MyPerformance: React.FC<MyPerformanceScreenProps> = () => {
  const [summary, setSummary] = useState<DashboardSummaryModel | null>(null);
  const [workload, setWorkload] = useState<WorkloadEntryModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [dashboardResponse, workloadResponse] = await Promise.all([
          DashboardService.getDashboard(),
          DashboardService.getWorkload(),
        ]);

        if (!active) return;

        setSummary(mapDashboardSummary(dashboardResponse?.data?.summary));
        setWorkload(
          (workloadResponse?.data?.workload ?? []).map(mapWorkloadEntry),
        );
      } catch (caught: any) {
        if (active) {
          setError(caught?.message ?? "Couldn't load your performance.");
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
  }, []);

  const metrics = {
    assigned: summary?.assignedTasks ?? 0,
    completed: summary?.completedTasks ?? 0,
    inProgress: summary?.inProgressTasks ?? 0,
    overdue: summary?.overdueTasks ?? 0,
    awaiting: summary?.pendingApprovals ?? 0,
    completionRate: Math.round(summary?.completionRate ?? 0),
  };

  // Load per project, so it is obvious where the work sits. The API sends no
  // project color, so tint it deterministically off the id like avatars do.
  const byProject = useMemo(
    () =>
      workload
        .filter((entry) => entry.total > 0)
        .map((entry) => ({
          ...entry,
          color: getAvatarColor(entry.projectId),
          percent: Math.round((entry.completed / entry.total) * 100),
        })),
    [workload],
  );

  return (
    <Container>
      <Header title="My Performance" showBack />
      <WhiteContainer style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Headline */}
          <View style={styles.headline}>
            <Text style={styles.headlineValue}>{metrics.completionRate}%</Text>
            <Text style={styles.headlineLabel}>Completion rate</Text>
            <ProgressBar
              progress={metrics.completionRate}
              height={8}
              style={styles.headlineBar}
            />
            <View style={styles.headlineFooter}>
              <View style={styles.headlineFooterItem}>
                <Ionicons
                  name="checkmark-done-outline"
                  size={14}
                  color={Colors.success}
                />
                <Text style={styles.headlineFooterText}>
                  {metrics.completed} of {metrics.assigned} completed
                </Text>
              </View>
              <View style={styles.headlineFooterItem}>
                <Ionicons
                  name="timer-outline"
                  size={14}
                  color={Colors.primary}
                />
                <Text style={styles.headlineFooterText}>
                  {summary?.openTasks ?? 0} still open
                </Text>
              </View>
            </View>
          </View>

          {/* Breakdown */}
          <View style={styles.statsRow}>
            <StatCard
              icon="albums-outline"
              label="Assigned"
              value={metrics.assigned}
              color={Colors.primary}
            />
            <StatCard
              icon="checkmark-circle-outline"
              label="Completed"
              value={metrics.completed}
              color={Colors.success}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              icon="play-circle-outline"
              label="In Progress"
              value={metrics.inProgress}
              color={Colors.statusInProgress}
            />
            <StatCard
              icon="alert-circle-outline"
              label="Overdue"
              value={metrics.overdue}
              color={Colors.danger}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              icon="hourglass-outline"
              label="Awaiting Approval"
              value={metrics.awaiting}
              color={Colors.warning}
            />
            <View style={styles.statsSpacer} />
          </View>

          {/* Per project */}
          <SectionHeader title="By project" style={styles.sectionHeader} />
          <View style={styles.projectCard}>
            {loading ? (
              <Loader />
            ) : byProject.length > 0 ? (
              byProject.map((entry, index) => (
                <View
                  key={entry.projectId}
                  style={[styles.projectRow, index > 0 && styles.projectRowGap]}
                >
                  <View style={styles.projectHeader}>
                    <View
                      style={[
                        styles.projectDot,
                        { backgroundColor: entry.color },
                      ]}
                    />
                    <Text style={styles.projectName} numberOfLines={1}>
                      {entry.projectName}
                    </Text>
                    <Text style={styles.projectCount}>
                      {entry.completed}/{entry.total}
                    </Text>
                  </View>
                  <ProgressBar progress={entry.percent} color={entry.color} />
                </View>
              ))
            ) : (
              <Text style={styles.empty}>
                {error ?? "No tasks assigned to you yet this cycle."}
              </Text>
            )}
          </View>
        </ScrollView>
      </WhiteContainer>
    </Container>
  );
};

export default MyPerformance;

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  content: {
    paddingBottom: 40,
  },
  headline: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    padding: 20,
    marginBottom: 16,
  },
  headlineValue: {
    fontSize: 40,
    fontWeight: "700",
    color: Colors.black,
    letterSpacing: -1.5,
  },
  headlineLabel: {
    fontSize: 13,
    color: Colors.mutedFont,
    fontWeight: "500",
    marginTop: 2,
    marginBottom: 16,
  },
  headlineBar: {
    marginBottom: 16,
  },
  headlineFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  headlineFooterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headlineFooterText: {
    fontSize: 12,
    color: Colors.lightFont,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statsSpacer: {
    flex: 1,
  },
  sectionHeader: {
    marginTop: 20,
  },
  projectCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    padding: 16,
  },
  projectRow: {
    gap: 8,
  },
  projectRowGap: {
    marginTop: 18,
  },
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  projectCount: {
    fontSize: 12,
    color: Colors.mutedFont,
    fontWeight: "600",
  },
  empty: {
    fontSize: 13,
    color: Colors.mutedFont,
    textAlign: "center",
    paddingVertical: 12,
  },
});
