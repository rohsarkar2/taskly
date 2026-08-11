import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "../configs/Colors";
import { CommentModel } from "../models/task";
import { formatRelativeTime } from "../utils/Formatters";
import Avatar from "./Avatar";

type CommentItemProps = {
  comment: CommentModel;
  isOwnComment?: boolean;
  onReplyPress?: (comment: CommentModel) => void;
  onEditPress?: (comment: CommentModel) => void;
  onDeletePress?: (comment: CommentModel) => void;
};

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  isOwnComment = false,
  onReplyPress,
  onEditPress,
  onDeletePress,
}) => {
  const author = comment.author;
  const authorName = author?.name ?? "Unknown";

  // Highlight @mentions so they read as references, not plain text.
  const renderBody = () => {
    const parts = comment.content.split(/(@[\w.@-]+(?: [A-Z][a-z]+)?)/g);

    return (
      <Text style={styles.body}>
        {parts.map((part, index) =>
          part.startsWith("@") ? (
            <Text key={index} style={styles.mention}>
              {part}
            </Text>
          ) : (
            part
          )
        )}
      </Text>
    );
  };

  return (
    <View style={[styles.container, comment.parentId ? styles.reply : null]}>
      <Avatar name={authorName} image={author?.image} size={36} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.author}>{authorName}</Text>
          <Text style={styles.time}>
            {formatRelativeTime(comment.createdAt)}
            {comment.edited ? " · edited" : ""}
          </Text>
        </View>

        {renderBody()}

        <View style={styles.actions}>
          {onReplyPress ? (
            <TouchableOpacity
              onPress={() => onReplyPress(comment)}
              activeOpacity={0.7}
            >
              <Text style={styles.action}>Reply</Text>
            </TouchableOpacity>
          ) : null}
          {isOwnComment && onEditPress ? (
            <TouchableOpacity
              onPress={() => onEditPress(comment)}
              activeOpacity={0.7}
            >
              <Text style={styles.action}>Edit</Text>
            </TouchableOpacity>
          ) : null}
          {isOwnComment && onDeletePress ? (
            <TouchableOpacity
              onPress={() => onDeletePress(comment)}
              activeOpacity={0.7}
            >
              <Text style={[styles.action, styles.destructive]}>Delete</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

export default CommentItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 12,
    gap: 12,
  },
  reply: {
    marginLeft: 32,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: Colors.leaderboardBorderVeryLight,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 8,
  },
  author: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
  },
  time: {
    fontSize: 11,
    color: Colors.mutedFont,
  },
  body: {
    fontSize: 14,
    color: Colors.secondaryFont,
    lineHeight: 20,
  },
  mention: {
    color: Colors.primary,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    marginTop: 8,
    gap: 16,
  },
  action: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
  destructive: {
    color: Colors.danger,
  },
});
