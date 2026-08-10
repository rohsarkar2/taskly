import React, { useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Container,
  EmptyState,
  Header,
  NotificationItem,
  SegmentedTabs,
  WhiteContainer,
} from "../components";
import type { TabItem } from "../components";
import Colors from "../configs/Colors";
import { notifications as seedNotifications } from "../data";
import {
  NotificationCategory,
  NotificationModel,
} from "../models/notification";
import { NotificationsScreenProps } from "../navigation/NavigationTypes";

type NotificationTab = "all" | NotificationCategory;

const Notifications: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const [items, setItems] = useState<NotificationModel[]>(seedNotifications);
  const [activeTab, setActiveTab] = useState<NotificationTab>("all");
  const [refreshing, setRefreshing] = useState(false);

  const unreadCount = items.filter((item) => !item.read).length;

  const tabs: TabItem<NotificationTab>[] = [
    { key: "all", label: "All" },
    { key: "task", label: "Tasks" },
    { key: "project", label: "Projects" },
    { key: "approval", label: "Approvals" },
    { key: "organization", label: "Organization" },
  ];

  const visible = useMemo(
    () =>
      activeTab === "all"
        ? items
        : items.filter((item) => item.category === activeTab),
    [items, activeTab]
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  const markAllRead = () =>
    setItems((previous) => previous.map((item) => ({ ...item, read: true })));

  // Tapping a notification deep links to whatever it is about.
  const handlePress = (notification: NotificationModel) => {
    setItems((previous) =>
      previous.map((item) =>
        item.id === notification.id ? { ...item, read: true } : item
      )
    );

    navigation.navigate("NotificationDetails", {
      notificationId: notification.id,
    });
  };

  return (
    <Container>
      <Header
        title="Notifications"
        right={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllRead} activeOpacity={0.7}>
              <Text style={styles.markAll}>Mark all read</Text>
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
            <NotificationItem notification={item} onPress={handlePress} />
          )}
          contentContainerStyle={[
            styles.list,
            visible.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="notifications-off-outline"
              title="Nothing here"
              subtitle="You'll see task assignments, approvals and mentions here."
            />
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
