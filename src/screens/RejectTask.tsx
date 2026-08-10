import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  Button,
  Container,
  Header,
  Input,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import { getTaskById } from "../data";
import { RejectTaskScreenProps } from "../navigation/NavigationTypes";

const QUICK_REASONS = [
  "Please add test cases before submitting again.",
  "The acceptance criteria are not fully covered.",
  "Needs a design review before it can be approved.",
  "Please attach evidence or a screen recording.",
];

const RejectTask: React.FC<RejectTaskScreenProps> = ({ navigation, route }) => {
  const { taskId, mode } = route.params;
  const task = getTaskById(taskId);

  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const isReturn = mode === "return";
  const heading = isReturn ? "Return for Changes" : "Reject Task";
  const resultingStatus = isReturn ? "In Progress" : "Rejected";

  const handleSubmit = () => {
    if (reason.trim().length < 10) {
      setError("Give at least a sentence so the assignee knows what to fix");
      return;
    }

    setError(undefined);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        isReturn ? "Returned" : "Rejected",
        `The task is now ${resultingStatus} and the assignee has been notified.`,
        [{ text: "OK", onPress: () => navigation.popToTop() }]
      );
    }, 700);
  };

  return (
    <Container>
      <Header title={heading} showBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <WhiteContainer style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {task ? (
              <View style={styles.taskCard}>
                <Text style={styles.taskLabel}>Task</Text>
                <Text style={styles.taskTitle}>{task.title}</Text>
              </View>
            ) : null}

            <View
              style={[
                styles.notice,
                isReturn ? styles.noticeReturn : styles.noticeReject,
              ]}
            >
              <Ionicons
                name={isReturn ? "arrow-undo-outline" : "close-circle-outline"}
                size={18}
                color={isReturn ? Colors.warning : Colors.danger}
              />
              <Text style={styles.noticeText}>
                {isReturn
                  ? "The task goes back to In Progress so the assignee can rework it."
                  : "The task is marked Rejected. The assignee can pick it back up after reading your notes."}
              </Text>
            </View>

            <Input
              label="Reason"
              placeholder="Explain what needs to change…"
              value={reason}
              onChangeText={setReason}
              multiline
              error={error}
              hint="This is required and will be visible to the assignee."
            />

            <Text style={styles.quickLabel}>Quick reasons</Text>
            <View style={styles.quickList}>
              {QUICK_REASONS.map((quickReason) => (
                <TouchableOpacity
                  key={quickReason}
                  style={styles.quickChip}
                  onPress={() => setReason(quickReason)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickChipText}>{quickReason}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title={isReturn ? "Return Task" : "Reject Task"}
              onPress={handleSubmit}
              loading={loading}
              backgroundColor={isReturn ? Colors.warning : Colors.danger}
              style={[styles.submit]}
            />
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => navigation.goBack()}
            />
          </ScrollView>
        </WhiteContainer>
      </KeyboardAvoidingView>
    </Container>
  );
};

export default RejectTask;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  content: {
    paddingBottom: 48,
  },
  taskCard: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  taskLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.mutedFont,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
    marginTop: 5,
    lineHeight: 21,
  },
  notice: {
    flexDirection: "row",
    gap: 10,
    borderRadius: 12,
    padding: 13,
    marginBottom: 20,
  },
  noticeReturn: {
    backgroundColor: Colors.warningSoft,
  },
  noticeReject: {
    backgroundColor: Colors.dangerSoft,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: Colors.secondaryFont,
    lineHeight: 19,
  },
  quickLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.lightFont,
    marginBottom: 10,
  },
  quickList: {
    gap: 8,
  },
  quickChip: {
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  quickChipText: {
    fontSize: 13,
    color: Colors.secondaryFont,
    lineHeight: 18,
  },
  submit: {
    marginTop: 28,
    marginBottom: 12,
  },
});
