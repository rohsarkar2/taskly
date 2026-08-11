import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  Button,
  Container,
  EmptyState,
  Header,
  Loader,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import { NotificationModel } from "../models/notification";
import { NotificationDetailsScreenProps } from "../navigation/NavigationTypes";
import NotificationService from "../services/NotificationService";
import { formatDateTime } from "../utils/Formatters";
import { mapApiNotification } from "../utils/Mappers";

const NotificationDetails: React.FC<NotificationDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { notificationId } = route.params;

  const [notification, setNotification] = useState<NotificationModel | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  // There is no single-notification endpoint, so this reads the list and picks
  // the one that was tapped.
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const response = await NotificationService.notificationList({
          limit: 50,
        });
        if (!active) return;

        const match = (response?.data?.notifications ?? [])
          .map(mapApiNotification)
          .find((item: NotificationModel) => item.id === notificationId);

        setNotification(match ?? null);
      } catch {
        // The empty state covers a failed load.
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [notificationId]);

  const handleDelete = () =>
    Alert.alert("Delete notification", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await NotificationService.deleteNotification(notificationId);
            navigation.goBack();
          } catch (caught: any) {
            Alert.alert(
              "Couldn't delete",
              caught?.message ?? "Something went wrong. Please try again.",
            );
          }
        },
      },
    ]);

  if (loading) {
    return (
      <Container>
        <Header title="Notification" showBack />
        <WhiteContainer>
          <Loader style={styles.screenLoader} size="large" />
        </WhiteContainer>
      </Container>
    );
  }

  if (!notification) {
    return (
      <Container>
        <Header title="Notification" showBack />
        <WhiteContainer>
          <EmptyState
            icon="notifications-off-outline"
            title="Notification not found"
            subtitle="It may have been cleared."
          />
        </WhiteContainer>
      </Container>
    );
  }

  // The notification carries the ids; the task and project screens fetch the
  // real records themselves.
  const taskId = notification.taskId;
  const projectId = notification.projectId;

  return (
    <Container>
      <Header title="Notification" showBack />
      <WhiteContainer style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>{notification.title}</Text>
            <Text style={styles.body}>{notification.body}</Text>

            <View style={styles.metaRow}>
              <Ionicons
                name="time-outline"
                size={14}
                color={Colors.mutedFont}
              />
              <Text style={styles.metaText}>
                {formatDateTime(notification.createdAt)}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            {taskId ? (
              <Button
                title="Open Task"
                onPress={() => navigation.navigate("TaskDetails", { taskId })}
              />
            ) : null}
            {projectId ? (
              <Button
                title="Open Project"
                variant="secondary"
                onPress={() =>
                  navigation.navigate("ProjectDetails", { projectId })
                }
              />
            ) : null}
            {!taskId && !projectId ? (
              <Button
                title="Back to Notifications"
                variant="secondary"
                onPress={() => navigation.goBack()}
              />
            ) : null}
            <Button
              title="Delete"
              variant="secondary"
              textStyle={styles.deleteText}
              onPress={handleDelete}
            />
          </View>
        </ScrollView>
      </WhiteContainer>
    </Container>
  );
};

export default NotificationDetails;

const styles = StyleSheet.create({
  screenLoader: {
    flex: 1,
  },
  deleteText: {
    color: Colors.danger,
  },
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  content: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
    lineHeight: 25,
  },
  body: {
    fontSize: 14,
    color: Colors.secondaryFont,
    lineHeight: 21,
    marginTop: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
  },
  metaText: {
    fontSize: 12,
    color: Colors.mutedFont,
  },
  actorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },
  actorText: {
    flex: 1,
  },
  actorName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
  },
  actorRole: {
    fontSize: 12,
    color: Colors.mutedFont,
    marginTop: 2,
  },
  actions: {
    marginTop: 28,
    gap: 12,
  },
});
