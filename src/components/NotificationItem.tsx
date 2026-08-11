import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../configs/Colors";
import {
  NotificationCategory,
  NotificationModel,
} from "../models/notification";
import { formatRelativeTime } from "../utils/Formatters";

const CATEGORY_ICONS: Record<
  NotificationCategory,
  { icon: string; color: string }
> = {
  task: { icon: "checkbox-outline", color: Colors.statusInProgress },
  project: { icon: "folder-open-outline", color: Colors.primary },
  approval: { icon: "shield-checkmark-outline", color: Colors.warning },
  organization: { icon: "business-outline", color: Colors.statusBlocked },
};

type NotificationItemProps = {
  notification: NotificationModel;
  onPress?: (notification: NotificationModel) => void;
  onLongPress?: (notification: NotificationModel) => void;
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onLongPress,
}) => {
  const meta = CATEGORY_ICONS[notification.category];

  return (
    <TouchableOpacity
      style={[styles.row, !notification.read && styles.rowUnread]}
      onPress={() => onPress?.(notification)}
      onLongPress={onLongPress ? () => onLongPress(notification) : undefined}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: `${meta.color}1A` }]}>
        <Ionicons name={meta.icon} size={20} color={meta.color} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.time}>
            {formatRelativeTime(notification.createdAt)}
          </Text>
        </View>
        <Text style={styles.body} numberOfLines={2}>
          {notification.body}
        </Text>
      </View>

      {!notification.read ? <View style={styles.unreadDot} /> : null}
    </TouchableOpacity>
  );
};

export default NotificationItem;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 12,
    backgroundColor: Colors.white,
    marginBottom: 6,
  },
  rowUnread: {
    backgroundColor: Colors.secondary,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
  },
  time: {
    fontSize: 11,
    color: Colors.mutedFont,
  },
  body: {
    fontSize: 13,
    color: Colors.lightFont,
    lineHeight: 18,
    marginTop: 3,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
  },
});
