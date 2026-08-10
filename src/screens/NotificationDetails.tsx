import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  Avatar,
  Button,
  Container,
  EmptyState,
  Header,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import {
  getProjectById,
  getTaskById,
  getUserById,
  notifications,
} from "../data";
import { NotificationDetailsScreenProps } from "../navigation/NavigationTypes";
import { formatDateTime } from "../utils/Formatters";

const NotificationDetails: React.FC<NotificationDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const notification = notifications.find(
    (item) => item.id === route.params.notificationId
  );

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

  const actor = getUserById(notification.actorId);
  const task = getTaskById(notification.taskId);
  const project = getProjectById(notification.projectId);

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

          {actor ? (
            <View style={styles.actorCard}>
              <Avatar name={actor.name} image={actor.image} size={40} />
              <View style={styles.actorText}>
                <Text style={styles.actorName}>{actor.name}</Text>
                <Text style={styles.actorRole}>{actor.jobTitle}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.actions}>
            {task ? (
              <Button
                title="Open Task"
                onPress={() =>
                  navigation.navigate("TaskDetails", { taskId: task.id })
                }
              />
            ) : null}
            {project ? (
              <Button
                title="Open Project"
                variant="secondary"
                onPress={() =>
                  navigation.navigate("ProjectDetails", {
                    projectId: project.id,
                  })
                }
              />
            ) : null}
            {!task && !project ? (
              <Button
                title="Back to Notifications"
                variant="secondary"
                onPress={() => navigation.goBack()}
              />
            ) : null}
          </View>
        </ScrollView>
      </WhiteContainer>
    </Container>
  );
};

export default NotificationDetails;

const styles = StyleSheet.create({
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
