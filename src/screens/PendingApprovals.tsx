import React, { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  Avatar,
  Badge,
  Container,
  EmptyState,
  Header,
  Loader,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import { TaskModel } from "../models/task";
import { PendingApprovalsScreenProps } from "../navigation/NavigationTypes";
import TaskService from "../services/TaskService";
import { useAppSelector } from "../store/hooks";
import {
  formatDueDate,
  formatRelativeTime,
  getTaskPriorityMeta,
  isOverdue,
} from "../utils/Formatters";
import { mapApiTask } from "../utils/Mappers";

const PendingApprovals: React.FC<PendingApprovalsScreenProps> = ({
  navigation,
}) => {
  const user = useAppSelector((state) => state.user.userData);
  const [queue, setQueue] = useState<TaskModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only tasks where you are listed as an approver come back here.
  const loadQueue = useCallback(async () => {
    try {
      setError(null);
      const response = await TaskService.pendingApprovals();
      setQueue((response?.data?.tasks ?? []).map(mapApiTask));
    } catch (caught: any) {
      setError(caught?.message ?? "Couldn't load your approval queue.");
      setQueue([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        await loadQueue();
        if (active) {
          setLoading(false);
        }
      })();

      return () => {
        active = false;
      };
    }, [loadQueue]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadQueue();
    setRefreshing(false);
  };

  const renderItem = (task: TaskModel) => {
    const submitter = task.assignee;
    const overdue = isOverdue(task.dueDate, task.status);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("ApprovalDetails", { taskId: task.id })
        }
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.title} numberOfLines={2}>
            {task.title}
          </Text>
          <Badge meta={getTaskPriorityMeta(task.priority)} size="small" />
        </View>

        <View style={styles.submitterRow}>
          <Avatar
            name={submitter?.name ?? "Unknown"}
            image={submitter?.image}
            size={26}
          />
          <Text style={styles.submitterText}>
            {submitter?.name ?? "Unknown"} · {task.project?.name ?? "Project"}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons
              name="calendar-outline"
              size={13}
              color={overdue ? Colors.danger : Colors.lightFont}
            />
            <Text style={[styles.metaText, overdue && styles.metaOverdue]}>
              {formatDueDate(task.dueDate)}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons
              name="paper-plane-outline"
              size={13}
              color={Colors.lightFont}
            />
            <Text style={styles.metaText}>
              Submitted {formatRelativeTime(task.submittedAt ?? task.updatedAt)}
            </Text>
          </View>
        </View>

        <View style={styles.reviewRow}>
          <Text style={styles.reviewText}>Review</Text>
          <Ionicons name="arrow-forward" size={15} color={Colors.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Container>
      <Header title="Pending Approvals" showBack />
      <WhiteContainer style={styles.container}>
        {queue.length > 0 ? (
          <View style={styles.summary}>
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color={Colors.primary}
            />
            <Text style={styles.summaryText}>
              {queue.length} task{queue.length === 1 ? "" : "s"} waiting on your
              review
            </Text>
          </View>
        ) : null}

        <FlatList
          data={queue}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderItem(item)}
          contentContainerStyle={[
            styles.list,
            queue.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loading ? (
              <Loader size="large" />
            ) : (
              <EmptyState
                icon={error ? "cloud-offline-outline" : undefined}
                title={error ? "Couldn't load approvals" : "Nothing to approve"}
                subtitle={
                  error ??
                  (user?.role === "team-member"
                    ? "Approvals are handled by Team Leads and Managers."
                    : "You're all caught up — no tasks are waiting on you.")
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

export default PendingApprovals;

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
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
  list: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  summaryText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "500",
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
    lineHeight: 21,
  },
  submitterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  submitterText: {
    fontSize: 13,
    color: Colors.lightFont,
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
  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.leaderboardBorderVeryLight,
  },
  reviewText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
  },
});
