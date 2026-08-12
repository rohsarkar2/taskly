import React, { useEffect, useRef, useState } from "react";
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
  ProjectMemberModel,
  ProjectModel,
  ProjectWorkflowModel,
} from "../models/project";
import { TaskPriority } from "../models/task";
import { CreateTaskScreenProps } from "../navigation/NavigationTypes";
import ProjectService from "../services/ProjectService";
import TaskService from "../services/TaskService";
import { useAppSelector } from "../store/hooks";
import {
  formatDate,
  getAvatarColor,
  getTaskPriorityMeta,
} from "../utils/Formatters";
import {
  mapApiProject,
  mapApiProjectMember,
  mapApiTask,
  mapApiWorkflow,
} from "../utils/Mappers";

type SheetKind = "project" | "priority" | "assignee" | null;

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
  const editingTaskId = route.params?.taskId;
  const isEditing = Boolean(editingTaskId);

  const user = useAppSelector((state) => state.user.userData);
  const richText = useRef<RichEditor>(null);

  const [myProjects, setMyProjects] = useState<ProjectModel[]>([]);
  const [members, setMembers] = useState<ProjectMemberModel[]>([]);
  const [workflow, setWorkflow] = useState<ProjectWorkflowModel | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(route.params?.projectId ?? "");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [assigneeId, setAssigneeId] = useState(user?.id ?? "");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [openSheet, setOpenSheet] = useState<SheetKind>(null);
  const [loading, setLoading] = useState(false);

  // Projects you belong to back the picker; the API already scopes the list.
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const response = await ProjectService.projectList({ status: "active" });
        if (!active) return;

        const projects = (response?.data?.projects ?? []).map(mapApiProject);
        setMyProjects(projects);
        setProjectId((current) => current || projects[0]?.id || "");
      } catch {
        // The picker stays empty and submit blocks on the missing project.
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // Editing pulls the current values rather than trusting the list payload.
  useEffect(() => {
    if (!editingTaskId) {
      return;
    }

    let active = true;

    (async () => {
      try {
        const response = await TaskService.getTaskDetails(editingTaskId);
        if (!active) return;

        const task = mapApiTask(response?.data?.task);
        setTitle(task.title);
        setDescription(task.description);
        setProjectId(task.projectId);
        setPriority(task.priority);
        setAssigneeId(task.assignee?.id ?? "");
        if (task.dueDate) {
          setDueDate(new Date(task.dueDate));
        }
        richText.current?.setContentHTML(task.description);
      } catch (caught: any) {
        Alert.alert(
          "Couldn't load task",
          caught?.message ?? "Something went wrong. Please try again.",
        );
      }
    })();

    return () => {
      active = false;
    };
  }, [editingTaskId]);

  // The members list and the effective workflow both hang off the project.
  useEffect(() => {
    if (!projectId) {
      setMembers([]);
      setWorkflow(null);
      return;
    }

    let active = true;

    (async () => {
      try {
        const [membersResponse, detailsResponse] = await Promise.all([
          ProjectService.getProjectMembers(projectId),
          ProjectService.getProjectDetails(projectId),
        ]);
        if (!active) return;

        setMembers(
          (membersResponse?.data?.members ?? []).map(mapApiProjectMember),
        );
        setWorkflow(mapApiWorkflow(detailsResponse?.data?.workflow));
      } catch {
        if (active) {
          setMembers([]);
          setWorkflow(null);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [projectId]);

  const project = myProjects.find((item) => item.id === projectId);
  const assignee = members.find((member) => member.id === assigneeId);

  // A plain member may only assign work to themselves.
  const canAssignOthers =
    project?.projectRole === "manager" || project?.projectRole === "team-lead";

  console.log(canAssignOthers);

  const projectOptions: SheetOption[] = myProjects.map((item) => ({
    key: item.id,
    label: item.name,
    icon: "ellipse",
    color: getAvatarColor(item.id),
  }));

  const assigneeOptions: SheetOption[] = (
    canAssignOthers
      ? members
      : members.filter((member) => member.id === user?.id)
  ).map((member) => ({
    key: member.id,
    label: member.name,
    description: member.designation,
    icon: "person-outline",
  }));

  const handleSubmit = async () => {
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

    try {
      if (isEditing && editingTaskId) {
        // Status isn't editable here — it moves through the status endpoints.
        await TaskService.updateTask(editingTaskId, {
          title: title.trim(),
          description,
          priority,
          dueDate: dueDate.toISOString().split("T")[0],
        });
      } else {
        await TaskService.createTask({
          title: title.trim(),
          description,
          projectId,
          assignee: assigneeId || undefined,
          priority,
          dueDate: dueDate.toISOString().split("T")[0],
        });
      }

      Alert.alert(
        isEditing ? "Task updated" : "Task created",
        isEditing
          ? "Your changes have been saved."
          : "The task has been added to the project.",
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch (error: any) {
      Alert.alert(
        isEditing ? "Couldn't save" : "Couldn't create task",
        error?.message ?? "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderPicker = (
    label: string,
    value: string,
    icon: string,
    onPress: () => void,
    accessory?: React.ReactNode,
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
                  style={[
                    styles.dot,
                    { backgroundColor: getAvatarColor(project.id) },
                  ]}
                />
              ) : undefined,
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
              />,
            )}

            {renderPicker(
              "Due Date",
              formatDate(dueDate.toISOString()),
              "calendar-outline",
              () => setShowDatePicker(true),
            )}

            {/* Editing can't move the task between people — only the API's
                assignment endpoints do that. */}
            {isEditing
              ? null
              : renderPicker(
                  "Assign To",
                  assignee?.name ?? "Select a team member",
                  "person-outline",
                  () => setOpenSheet("assignee"),
                  assignee ? (
                    <Avatar
                      name={assignee.name}
                      image={assignee.avatar}
                      size={24}
                    />
                  ) : undefined,
                )}

            <View style={styles.notice}>
              <Ionicons
                name="information-circle-outline"
                size={17}
                color={Colors.primary}
              />
              <Text style={styles.noticeText}>
                {workflow?.requireTaskApproval
                  ? `Completing this task will need approval on ${
                      project?.name ?? "the project"
                    }.`
                  : `Tasks on ${
                      project?.name ?? "this project"
                    } complete without review.`}
                {canAssignOthers
                  ? ""
                  : " As a project member you can only assign work to yourself."}
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
