import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import React, { useState, useRef } from "react";
import { CreateTaskScreenProps } from "../navigation/NavigationTypes";
import { Container, Header, WhiteContainer, Button } from "../components";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";
import Colors from "../configs/Colors";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import TaskService from "../services/TaskService";

const CreateTask: React.FC<CreateTaskScreenProps> = ({ navigation, route }) => {
  const richText = useRef<RichEditor>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"pending" | "in-progress" | "completed">(
    "pending",
  );
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    {
      value: "pending",
      label: "Pending",
      icon: "hourglass-outline",
      color: "#FF6B35",
    },
    {
      value: "in-progress",
      label: "In Progress",
      icon: "time-outline",
      color: "#3498db",
    },
    {
      value: "completed",
      label: "Completed",
      icon: "checkmark-circle-outline",
      color: "#00B894",
    },
  ];

  const handleConfirmDate = (selectedDate: Date) => {
    setShowDatePicker(false);
    setDueDate(selectedDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCreateTask = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert("Validation Error", "Please enter a task title", [
        { text: "OK" },
      ]);
      return;
    }

    // Check if description is empty (strip HTML tags for validation)
    const strippedDescription = description.replace(/<[^>]*>/g, "").trim();
    if (!strippedDescription) {
      Alert.alert("Validation Error", "Please enter a task description", [
        { text: "OK" },
      ]);
      return;
    }

    setLoading(true);

    try {
      const reqBody = {
        title: title.trim(),
        description: description.trim(),
        status,
        dueDate: dueDate.toISOString(),
      };

      const response = await TaskService.createTask(reqBody);

      setLoading(false);

      if (response) {
        Alert.alert("Success", "Task created successfully!", [
          {
            text: "OK",
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      }
    } catch (error: any) {
      setLoading(false);
      const errorMessage =
        error?.message || "Failed to create task. Please try again.";
      Alert.alert("Error", errorMessage, [{ text: "OK" }]);
    }
  };

  return (
    <Container>
      <Header title="Create Task" showBack />
      <WhiteContainer style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Title Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Task Title</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={Colors.mutedFont}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter task title"
                  placeholderTextColor={Colors.mutedFont}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={100}
                />
              </View>
            </View>

            {/* Description Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <View style={styles.richEditorContainer}>
                <RichToolbar
                  editor={richText}
                  actions={[
                    actions.setBold,
                    actions.setItalic,
                    actions.setUnderline,
                    actions.setStrikethrough,
                    actions.insertBulletsList,
                    actions.insertOrderedList,
                  ]}
                  style={styles.richToolbar}
                  iconTint={Colors.black}
                  selectedIconTint={Colors.primary}
                />
                <RichEditor
                  ref={richText}
                  onChange={setDescription}
                  placeholder="Enter task description"
                  style={styles.richEditor}
                  initialContentHTML={description}
                  initialHeight={200}
                  editorStyle={{ color: Colors.secondaryFont }}
                />
              </View>
            </View>

            {/* Status Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.statusContainer}>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.statusOption,
                      status === option.value && styles.statusOptionActive,
                      status === option.value && {
                        borderColor: option.color,
                        backgroundColor: `${option.color}10`,
                      },
                    ]}
                    onPress={() => {
                      if (option.value === "pending") {
                        setStatus("pending");
                      } else {
                        Alert.alert(
                          "Not Allowed",
                          "New tasks can only be created with 'Pending' status.",
                          [{ text: "OK" }],
                        );
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={24}
                      color={
                        status === option.value
                          ? option.color
                          : Colors.mutedFont
                      }
                    />
                    <Text
                      style={[
                        styles.statusOptionText,
                        status === option.value && {
                          color: option.color,
                          fontWeight: "600",
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Due Date Picker */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Due Date</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={Colors.primary}
                  style={styles.inputIcon}
                />
                <Text style={styles.datePickerText}>{formatDate(dueDate)}</Text>
                <Ionicons
                  name="chevron-down-outline"
                  size={20}
                  color={Colors.mutedFont}
                />
              </TouchableOpacity>
            </View>

            <DateTimePickerModal
              isVisible={showDatePicker}
              mode="date"
              date={dueDate}
              onConfirm={handleConfirmDate}
              onCancel={() => setShowDatePicker(false)}
              minimumDate={new Date()}
            />

            {/* Create Button */}
            <Button
              title={loading ? "Creating..." : "Create Task"}
              onPress={handleCreateTask}
              style={[styles.createButton]}
              disabled={loading}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </WhiteContainer>
    </Container>
  );
};

export default CreateTask;

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.secondaryFont,
    fontWeight: "400",
  },
  richEditorContainer: {
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.white,
  },
  richToolbar: {
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGray,
    minHeight: 50,
  },
  richEditor: {
    backgroundColor: Colors.white,
  },
  statusContainer: {
    flexDirection: "row",
    gap: 12,
  },
  statusOption: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.borderGray,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statusOptionActive: {
    borderWidth: 2,
  },
  statusOptionText: {
    fontSize: 12,
    color: Colors.mutedFont,
    marginTop: 8,
    textAlign: "center",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  datePickerText: {
    flex: 1,
    fontSize: 15,
    color: Colors.secondaryFont,
    fontWeight: "400",
  },
  createButton: {
    marginTop: 8,
  },
});
