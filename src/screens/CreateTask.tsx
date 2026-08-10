import React, { useRef, useState } from "react";
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
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";
import {
  Avatar,
  Button,
  Container,
  Header,
  Input,
  OptionSheet,
  WhiteContainer,
} from "../components";
import type { SheetOption } from "../components";
import Colors from "../configs/Colors";
import {
  getProjectById,
  getProjectMembers,
  getProjectsForUser,
  getTaskById,
  getUserById,
} from "../data";
import { TaskPriority } from "../models/task";
import { CreateTaskScreenProps } from "../navigation/NavigationTypes";
import { useAppSelector } from "../store/hooks";
import { formatDate, getTaskPriorityMeta } from "../utils/Formatters";

type SheetKind = "project" | "priority" | "assignee" | "approver" | null;

const PRIORITY_OPTIONS: SheetOption[] = (
  ["low", "medium", "high", "urgent"] as TaskPriority[]
).map((priority) => {
  const meta = getTaskPriorityMeta(priority);
  return {
    key: priority,
    label: meta.label,
    icon: "flag",
    color: meta.color,
  };
});

const CreateTask: React.FC<CreateTaskScreenProps> = ({ navigation, route }) => {
  const editingTask = getTaskById(route.params?.taskId);
  const isEditing = Boolean(editingTask);

  const user = useAppSelector((state) => state.user.userData);
  const richText = useRef<RichEditor>(null);

  const myProjects = user ? getProjectsForUser(user.id) : [];

  const [title, setTitle] = useState(editingTask?.title ?? "");
  const [description, setDescription] = useState(
    editingTask?.description ?? ""
  );
  const [projectId, setProjectId] = useState(
    editingTask?.projectId ?? route.params?.projectId ?? myProjects[0]?.id ?? ""
  );
  const [priority, setPriority] = useState<TaskPriority>(
    editingTask?.priority ?? "medium"
  );
  const [dueDate, setDueDate] = useState<Date>(
    editingTask ? new Date(editingTask.dueDate) : new Date()
  );
  const [assigneeId, setAssigneeId] = useState(
    editingTask?.assigneeId ?? user?.id ?? ""
  );
  const [approverId, setApproverId] = useState<string | null>(
    editingTask?.approverId ?? null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [openSheet, setOpenSheet] = useState<SheetKind>(null);
  const [loading, setLoading] = useState(false);

  const project = getProjectById(projectId);
  const members = projectId ? getProjectMembers(projectId) : [];
  const assignee = getUserById(assigneeId);
  const approver = getUserById(approverId);

  const projectOptions: SheetOption[] = myProjects.map((item) => ({
    key: item.id,
    label: item.name,
    icon: "ellipse",
    color: item.color,
  }));

  const assigneeOptions: SheetOption[] = members.map((member) => ({
    key: member.id,
    label: member.name,
    description: member.jobTitle,
    icon: "person-outline",
  }));

  // Only roles the project workflow allows can be picked as a named approver.
  const approverOptions: SheetOption[] = [
    {
      key: "any",
      label: "Anyone who can approve",
      description: "The project workflow decides who reviews this task",
      icon: "people-outline",
    },
    ...members
      .filter(
        (member) =>
          member.role !== "team-member" &&
          project?.approverRoles.includes(
            member.role as "team-lead" | "manager"
          )
      )
      .map((member) => ({
        key: member.id,
        label: member.name,
        description: member.role === "team-lead" ? "Team Lead" : "Manager",
        icon: "shield-checkmark-outline",
      })),
  ];

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Missing title", "Give the task a short, clear title.");
      return;
    }
    if (!projectId) {
      Alert.alert("Missing project", "Pick the project this task belongs to.");
      return;
    }
    if (!description.replace(/<[^>]*>/g, "").trim()) {
      Alert.alert("Missing description", "Describe what needs to be done.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        isEditing ? "Task updated" : "Task created",
        isEditing
          ? "Your changes have been saved."
          : "The task has been added to the project.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }, 700);
  };

  const renderPicker = (
    label: string,
    value: string,
    icon: string,
    onPress: () => void,
    accessory?: React.ReactNode
  ) => (
    <View style={styles.pickerBlock}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.picker}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {accessory ?? (
          <Ionicons name={icon} size={20} color={Colors.mutedFont} />
        )}
        <Text style={styles.pickerValue} numberOfLines={1}>
          {value}
        </Text>
        <Ionicons name="chevron-down" size={18} color={Colors.mutedFont} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Container>
      <Header title={isEditing ? "Edit Task" : "Create Task"} showBack />
      <WhiteContainer style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {renderPicker(
              "Project",
              project?.name ?? "Select a project",
              "folder-outline",
              () => setOpenSheet("project"),
              project ? (
                <View
                  style={[styles.dot, { backgroundColor: project.color }]}
                />
              ) : undefined
            )}

            <Input
              label="Title"
              icon="document-text-outline"
              placeholder="What needs to be done?"
              value={title}
              onChangeText={setTitle}
              maxLength={120}
            />

            {/* Rich text description */}
            <Text style={styles.label}>Description</Text>
            <View style={styles.editorCard}>
              <RichToolbar
                editor={richText}
                selectedIconTint={Colors.primary}
                iconTint={Colors.lightFont}
                style={styles.toolbar}
                actions={[
                  actions.setBold,
                  actions.setItalic,
                  actions.setUnderline,
                  actions.insertBulletsList,
                  actions.insertOrderedList,
                  actions.insertLink,
                  actions.undo,
                  actions.redo,
                ]}
              />
              <RichEditor
                ref={richText}
                initialContentHTML={description}
                onChange={setDescription}
                placeholder="Add details, acceptance criteria, links…"
                style={styles.editor}
                initialHeight={160}
              />
            </View>

            {renderPicker(
              "Priority",
              getTaskPriorityMeta(priority).label,
              "flag-outline",
              () => setOpenSheet("priority"),
              <Ionicons
                name="flag"
                size={18}
                color={getTaskPriorityMeta(priority).color}
              />
            )}

            {renderPicker(
              "Due Date",
              formatDate(dueDate.toISOString()),
              "calendar-outline",
              () => setShowDatePicker(true)
            )}

            {renderPicker(
              "Assign To",
              assignee?.name ?? "Select a team member",
              "person-outline",
              () => setOpenSheet("assignee"),
              assignee ? <Avatar name={assignee.name} size={24} /> : undefined
            )}

            {renderPicker(
              "Approver",
              approver?.name ?? "Anyone who can approve",
              "shield-checkmark-outline",
              () => setOpenSheet("approver"),
              approver ? <Avatar name={approver.name} size={24} /> : undefined
            )}

            <View style={styles.notice}>
              <Ionicons
                name="information-circle-outline"
                size={17}
                color={Colors.primary}
              />
              <Text style={styles.noticeText}>
                Leaving the approver open lets any eligible approver on{" "}
                {project?.name ?? "the project"} review this task.
              </Text>
            </View>

            <Button
              title={isEditing ? "Save Changes" : "Create Task"}
              onPress={handleSubmit}
              loading={loading}
              style={[styles.submit]}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </WhiteContainer>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        date={dueDate}
        onConfirm={(date) => {
          setShowDatePicker(false);
          setDueDate(date);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

      <OptionSheet
        visible={openSheet === "project"}
        title="Select project"
        options={projectOptions}
        selectedKey={projectId}
        onSelect={(option) => {
          setProjectId(option.key);
          setApproverId(null);
          setOpenSheet(null);
        }}
        onClose={() => setOpenSheet(null)}
      />

      <OptionSheet
        visible={openSheet === "priority"}
        title="Select priority"
        options={PRIORITY_OPTIONS}
        selectedKey={priority}
        onSelect={(option) => {
          setPriority(option.key as TaskPriority);
          setOpenSheet(null);
        }}
        onClose={() => setOpenSheet(null)}
      />

      <OptionSheet
        visible={openSheet === "assignee"}
        title="Assign to"
        options={assigneeOptions}
        selectedKey={assigneeId}
        onSelect={(option) => {
          setAssigneeId(option.key);
          setOpenSheet(null);
        }}
        onClose={() => setOpenSheet(null)}
      />

      <OptionSheet
        visible={openSheet === "approver"}
        title="Select approver"
        options={approverOptions}
        selectedKey={approverId ?? "any"}
        onSelect={(option) => {
          setApproverId(option.key === "any" ? null : option.key);
          setOpenSheet(null);
        }}
        onClose={() => setOpenSheet(null)}
      />
    </Container>
  );
};

export default CreateTask;

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingBottom: 48,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 8,
  },
  pickerBlock: {
    marginBottom: 18,
  },
  picker: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    backgroundColor: Colors.white,
    gap: 10,
  },
  pickerValue: {
    flex: 1,
    fontSize: 15,
    color: Colors.black,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  editorCard: {
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 18,
  },
  toolbar: {
    backgroundColor: Colors.surfaceMuted,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGray,
  },
  editor: {
    minHeight: 160,
  },
  notice: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 13,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: Colors.secondaryFont,
    lineHeight: 18,
  },
  submit: {
    marginTop: 28,
  },
});
