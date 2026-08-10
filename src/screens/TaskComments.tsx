import React, { useMemo, useState } from "react";
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
import { getCommentsByTaskId, getTaskById } from "../data";
import { CommentModel } from "../models/task";
import { TaskCommentsScreenProps } from "../navigation/NavigationTypes";
import { useAppSelector } from "../store/hooks";

const TaskComments: React.FC<TaskCommentsScreenProps> = ({ route }) => {
  const { taskId } = route.params;
  const user = useAppSelector((state) => state.user.userData);

  const task = getTaskById(taskId);
  const [comments, setComments] = useState<CommentModel[]>(() =>
    getCommentsByTaskId(taskId)
  );
  const [draft, setDraft] = useState("");
  const [replyingTo, setReplyingTo] = useState<CommentModel | null>(null);

  // Replies sit directly under their parent.
  const ordered = useMemo(() => {
    const roots = comments.filter((comment) => !comment.parentId);

    return roots.flatMap((root) => [
      root,
      ...comments.filter((comment) => comment.parentId === root.id),
    ]);
  }, [comments]);

  const handleSend = () => {
    if (!draft.trim() || !user) {
      return;
    }

    const newComment: CommentModel = {
      id: `c-local-${comments.length + 1}`,
      taskId,
      authorId: user.id,
      body: draft.trim(),
      createdAt: new Date().toISOString(),
      parentId: replyingTo?.id ?? null,
      mentionIds: [],
      edited: false,
    };

    setComments((previous) => [...previous, newComment]);
    setDraft("");
    setReplyingTo(null);
  };

  const handleDelete = (comment: CommentModel) => {
    Alert.alert("Delete comment", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          setComments((previous) =>
            previous.filter(
              (item) => item.id !== comment.id && item.parentId !== comment.id
            )
          ),
      },
    ]);
  };

  const handleEdit = (comment: CommentModel) => {
    setDraft(comment.body);
    setComments((previous) =>
      previous.filter((item) => item.id !== comment.id)
    );
    setReplyingTo(null);
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
                isOwnComment={item.authorId === user?.id}
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
                icon="chatbubbles-outline"
                title="No comments yet"
                subtitle="Ask a question or share an update on this task."
              />
            }
          />

          {replyingTo ? (
            <View style={styles.replyBanner}>
              <Ionicons
                name="return-down-forward-outline"
                size={15}
                color={Colors.primary}
              />
              <Text style={styles.replyText} numberOfLines={1}>
                Replying to {replyingTo.body}
              </Text>
              <TouchableOpacity
                onPress={() => setReplyingTo(null)}
                accessibilityRole="button"
                accessibilityLabel="Cancel reply"
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
                !draft.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!draft.trim()}
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
