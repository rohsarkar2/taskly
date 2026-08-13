import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  Container,
  EmptyState,
  Header,
  Loader,
  NotificationItem,
  SegmentedTabs,
  WhiteContainer,
} from "../components";
import type { TabItem } from "../components";
import Colors from "../configs/Colors";
import {
  NotificationCategory,
  NotificationModel,
} from "../models/notification";
import { NotificationsScreenProps } from "../navigation/NavigationTypes";
import NotificationService from "../services/NotificationService";
import { mapApiNotification } from "../utils/Mappers";

type NotificationTab = "all" | NotificationCategory;

const Notifications: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const [items, setItems] = useState<NotificationModel[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<NotificationTab>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setError(null);
      const response = await NotificationService.notificationList({
        limit: 50,
      });

      setItems((response?.data?.notifications ?? []).map(mapApiNotification));
      setUnreadCount(response?.data?.unreadCount ?? 0);
    } catch (caught: any) {
      setError(caught?.message ?? "Couldn't load your notifications.");
      setItems([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        await loadNotifications();
        if (active) {
          setLoading(false);
        }
      })();

      return () => {
        active = false;
      };
    }, [loadNotifications]),
  );

  const tabs: TabItem<NotificationTab>[] = [
    { key: "all", label: "All" },
    { key: "task", label: "Tasks" },
    { key: "project", label: "Projects" },
    { key: "approval", label: "Approvals" },
    { key: "organization", label: "Organization" },
  ];

  // The API filters by a single `type`; the tabs are groups of types, so the
  // grouping stays local.
  const visible = useMemo(
    () =>
      activeTab === "all"
        ? items
        : items.filter((item) => item.category === activeTab),
    [items, activeTab]
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAllRead = async () => {
    // Optimistic — the list is re-read on the next focus anyway.
    setItems((previous) => previous.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);

    try {
      await NotificationService.markAllAsRead();
    } catch (caught: any) {
      Alert.alert(
        "Couldn't mark all read",
        caught?.message ?? "Something went wrong. Please try again.",
      );
      await loadNotifications();
    }
  };

  const clearRead = () =>
    Alert.alert("Clear read", "Remove every notification you've read?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          try {
            await NotificationService.clearReadNotifications();
          } catch (caught: any) {
            Alert.alert(
              "Couldn't clear",
              caught?.message ?? "Something went wrong. Please try again.",
            );
          }
          await loadNotifications();
        },
      },
    ]);

  const handleDelete = (notification: NotificationModel) =>
    Alert.alert("Delete notification", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setItems((previous) =>
            previous.filter((item) => item.id !== notification.id)
          );

          try {
            await NotificationService.deleteNotification(notification.id);
          } catch (caught: any) {
            Alert.alert(
              "Couldn't delete",
              caught?.message ?? "Something went wrong. Please try again.",
            );
            await loadNotifications();
          }
        },
      },
    ]);

  // Tapping a notification marks it read, then deep links to what it is about.
  const handlePress = async (notification: NotificationModel) => {
    if (!notification.read) {
      setItems((previous) =>
        previous.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item
        )
      );
      setUnreadCount((previous) => Math.max(0, previous - 1));

      NotificationService.markAsRead(notification.id).catch(() => {
        // The badge corrects itself on the next load.
      });
    }

    navigation.navigate("NotificationDetails", {
      notificationId: notification.id,
    });
  };

  return (
    <Container>
      <Header
        title="Notifications"
        right={
          items.length > 0 ? (
            <TouchableOpacity
              onPress={unreadCount > 0 ? markAllRead : clearRead}
              activeOpacity={0.7}
            >
              <Text style={styles.markAll}>
                {unreadCount > 0 ? "Mark all read" : "Clear read"}
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />
      <WhiteContainer style={styles.container}>
        <SegmentedTabs
          tabs={tabs}
          activeKey={activeTab}
          onChange={setActiveTab}
          scrollable
          style={styles.tabs}
        />

        {unreadCount > 0 ? (
          <Text style={styles.unreadLabel}>
            {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
          </Text>
        ) : null}

        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={handlePress}
              onLongPress={handleDelete}
            />
          )}
          contentContainerStyle={[
            styles.list,
            visible.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loading ? (
              <Loader size="large" />
            ) : (
              <EmptyState
                illustration="notifications"
                icon={error ? "cloud-offline-outline" : undefined}
                title={error ? "Couldn't load notifications" : "Nothing here"}
                subtitle={
                  error ??
                  "You'll see task assignments, approvals and mentions here."
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

export default Notifications;

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  markAll: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
  },
  tabs: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  unreadLabel: {
    fontSize: 12,
    color: Colors.mutedFont,
    fontWeight: "500",
    marginTop: 14,
  },
  list: {
    paddingTop: 10,
    paddingBottom: 90,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
