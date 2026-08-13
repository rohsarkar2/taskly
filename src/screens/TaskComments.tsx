import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  CommentItem,
  Container,
  EmptyState,
  Header,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import {
  CommentModel,
  MentionableUserModel,
  TaskModel,
} from "../models/task";
import { TaskCommentsScreenProps } from "../navigation/NavigationTypes";
import CommentService from "../services/CommentService";
import TaskService from "../services/TaskService";
import { useAppSelector } from "../store/hooks";
import {
  mapApiComment,
  mapApiMentionableUser,
  mapApiTask,
} from "../utils/Mappers";

const TaskComments: React.FC<TaskCommentsScreenProps> = ({ route }) => {
  const { taskId } = route.params;
  const user = useAppSelector((state) => state.user.userData);

  const [task, setTask] = useState<TaskModel | null>(null);
  const [comments, setComments] = useState<CommentModel[]>([]);
  const [mentionable, setMentionable] = useState<MentionableUserModel[]>([]);
  const [draft, setDraft] = useState("");
  const [replyingTo, setReplyingTo] = useState<CommentModel | null>(null);
  const [editing, setEditing] = useState<CommentModel | null>(null);
  const [sending, setSending] = useState(false);

  const loadComments = useCallback(async () => {
    try {
      const response = await CommentService.commentList(taskId);
      setComments((response?.data?.comments ?? []).map(mapApiComment));
    } catch {
      // The empty state covers a failed load.
    }
  }, [taskId]);

  useEffect(() => {
    let active = true;

    (async () => {
      await loadComments();

      // The header title and the @-mention roster are independent of the feed.
      try {
        const [taskResponse, mentionResponse] = await Promise.all([
          TaskService.getTaskDetails(taskId),
          CommentService.getMentionableUsers(taskId),
        ]);
        if (!active) return;

        setTask(mapApiTask(taskResponse?.data?.task));
        setMentionable(
          (mentionResponse?.data?.users ?? []).map(mapApiMentionableUser),
        );
      } catch {
        // Mentions degrade to plain text; the API still resolves @names.
      }
    })();

    return () => {
      active = false;
    };
  }, [taskId, loadComments]);

  // The API nests replies inside their parent; the list is flat, so they are
  // spliced in directly under it.
  const ordered = useMemo(
    () => comments.flatMap((root) => [root, ...root.replies]),
    [comments]
  );

  // Only offer the picker while an @token is being typed.
  const mentionQuery = useMemo(() => {
    const match = draft.match(/@([\w.@-]*)$/);
    return match ? match[1].toLowerCase() : null;
  }, [draft]);

  const mentionMatches = useMemo(() => {
    if (mentionQuery === null) {
      return [];
    }

    return mentionable
      .filter(
        (person) =>
          !mentionQuery ||
          person.name.toLowerCase().includes(mentionQuery) ||
          person.email.toLowerCase().includes(mentionQuery)
      )
      .slice(0, 4);
  }, [mentionable, mentionQuery]);

  const applyMention = (person: MentionableUserModel) =>
    // The API matches `@name` against the project's members server side.
    setDraft((previous) =>
      previous.replace(/@([\w.@-]*)$/, `@${person.name} `)
    );

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || !user || sending) {
      return;
    }

    setSending(true);

    try {
      if (editing) {
        await CommentService.updateComment(editing.id, content);
      } else {
        await CommentService.addComment(taskId, content, replyingTo?.id);
      }

      setDraft("");
      setReplyingTo(null);
      setEditing(null);
      await loadComments();
    } catch (error: any) {
      Alert.alert(
        editing ? "Couldn't save" : "Couldn't post",
        error?.message ?? "Something went wrong. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  const handleDelete = (comment: CommentModel) => {
    Alert.alert("Delete comment", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await CommentService.deleteComment(comment.id);
          } catch (error: any) {
            Alert.alert(
              "Couldn't delete",
              error?.message ?? "Something went wrong. Please try again.",
            );
          }
          await loadComments();
        },
      },
    ]);
  };

  const handleEdit = (comment: CommentModel) => {
    setEditing(comment);
    setDraft(comment.content);
    setReplyingTo(null);
  };

  const cancelComposerMode = () => {
    setReplyingTo(null);
    setEditing(null);
    setDraft("");
  };

  return (
    <Container>
      <Header title="Comments" showBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <WhiteContainer style={styles.container}>
          {task ? (
            <Text style={styles.taskTitle} numberOfLines={1}>
              {task.title}
            </Text>
          ) : null}

          <FlatList
            data={ordered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CommentItem
                comment={item}
                isOwnComment={item.author?.id === user?.id}
                onReplyPress={item.parentId ? undefined : setReplyingTo}
                onEditPress={handleEdit}
                onDeletePress={handleDelete}
              />
            )}
            contentContainerStyle={[
              styles.list,
              ordered.length === 0 && styles.listEmpty,
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyState
                title="No comments yet"
                subtitle="Ask a question or share an update on this task."
              />
            }
          />

          {mentionMatches.length > 0 ? (
            <View style={styles.mentionBar}>
              {mentionMatches.map((person) => (
                <TouchableOpacity
                  key={person.id}
                  style={styles.mentionChip}
                  onPress={() => applyMention(person)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.mentionChipText} numberOfLines={1}>
                    {person.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {replyingTo || editing ? (
            <View style={styles.replyBanner}>
              <Ionicons
                name={
                  editing
                    ? "create-outline"
                    : "return-down-forward-outline"
                }
                size={15}
                color={Colors.primary}
              />
              <Text style={styles.replyText} numberOfLines={1}>
                {editing
                  ? "Editing your comment"
                  : `Replying to ${replyingTo?.content}`}
              </Text>
              <TouchableOpacity
                onPress={cancelComposerMode}
                accessibilityRole="button"
                accessibilityLabel={editing ? "Cancel edit" : "Cancel reply"}
              >
                <Ionicons name="close" size={16} color={Colors.lightFont} />
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.composer}>
            <TextInput
              style={styles.composerInput}
              value={draft}
              onChangeText={setDraft}
              placeholder="Write a comment… use @ to mention"
              placeholderTextColor={Colors.mutedFont}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!draft.trim() || sending) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!draft.trim() || sending}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Send comment"
            >
              <Ionicons name="send" size={17} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </WhiteContainer>
      </KeyboardAvoidingView>
    </Container>
  );
};

export default TaskComments;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  taskTitle: {
    fontSize: 13,
    color: Colors.mutedFont,
    fontWeight: "500",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.leaderboardBorderVeryLight,
  },
  mentionBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingBottom: 10,
  },
  mentionChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: Colors.secondary,
  },
  mentionChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
    maxWidth: 140,
  },
  list: {
    paddingBottom: 16,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  replyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.secondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 8,
  },
  replyText: {
    flex: 1,
    fontSize: 12,
    color: Colors.primary,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingBottom: 16,
  },
  composerInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 14,
    color: Colors.black,
    backgroundColor: Colors.surfaceMuted,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: Colors.mutedFont,
  },
});
