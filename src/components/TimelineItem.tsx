import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../configs/Colors";
import { ActivityModel, ActivityType } from "../models/task";
import { formatShortDate, formatTime } from "../utils/Formatters";

const ACTIVITY_META: Record<ActivityType, { icon: string; color: string }> = {
  created: { icon: "add-circle-outline", color: Colors.primary },
  assigned: { icon: "person-add-outline", color: Colors.statusInProgress },
  "status-changed": { icon: "swap-horizontal-outline", color: Colors.info },
  submitted: { icon: "paper-plane-outline", color: Colors.warning },
  approved: { icon: "checkmark-circle-outline", color: Colors.success },
  rejected: { icon: "close-circle-outline", color: Colors.danger },
  returned: { icon: "arrow-undo-outline", color: Colors.warning },
  commented: { icon: "chatbubble-outline", color: Colors.lightFont },
  "due-date-changed": { icon: "calendar-outline", color: Colors.statusBlocked },
};

type TimelineItemProps = {
  item: ActivityModel;
  isLast?: boolean;
  showDate?: boolean;
};

const TimelineItem: React.FC<TimelineItemProps> = ({
  item,
  isLast = false,
  showDate = false,
}) => {
  const meta = ACTIVITY_META[item.type];

  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        <View style={[styles.dot, { backgroundColor: `${meta.color}1A` }]}>
          <Ionicons name={meta.icon} size={14} color={meta.color} />
        </View>
        {!isLast ? <View style={styles.line} /> : null}
      </View>

      <View style={[styles.content, isLast && styles.contentLast]}>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>
          {showDate ? `${formatShortDate(item.createdAt)} · ` : ""}
          {formatTime(item.createdAt)}
        </Text>
      </View>
    </View>
  );
};

export default TimelineItem;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  rail: {
    alignItems: "center",
    marginRight: 12,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  line: {
    flex: 1,
    width: 1.5,
    backgroundColor: Colors.leaderboardBorderVeryLight,
    marginVertical: 4,
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  contentLast: {
    paddingBottom: 0,
  },
  message: {
    fontSize: 14,
    color: Colors.secondaryFont,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: Colors.mutedFont,
    marginTop: 3,
  },
});
