import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../configs/Colors";
import Button from "./Button";
import EmptyIllustration, { EmptyIllustrationName } from "./EmptyIllustration";

type EmptyStateProps = {
  title: string;
  subtitle?: string;
  /**
   * Which artwork to show. Ignored when `icon` is set — an error state wants a
   * pointed glyph, not the "nothing here yet" illustration.
   */
  illustration?: EmptyIllustrationName;
  icon?: string;
  /** Sits inside a card rather than filling a screen: tighter, smaller art. */
  compact?: boolean;
  actionTitle?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
};

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  illustration = "default",
  icon,
  compact = false,
  actionTitle,
  onActionPress,
  style,
}) => (
  <View style={[styles.container, compact && styles.containerCompact, style]}>
    {icon ? (
      <View style={[styles.iconCircle, compact && styles.iconCircleCompact]}>
        <Ionicons name={icon} size={compact ? 26 : 44} color={Colors.primary} />
      </View>
    ) : (
      <EmptyIllustration
        name={illustration}
        size={compact ? 96 : 148}
        style={compact ? styles.artCompact : styles.art}
      />
    )}

    <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>

    {subtitle ? (
      <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>
        {subtitle}
      </Text>
    ) : null}

    {actionTitle && onActionPress ? (
      <Button
        title={actionTitle}
        onPress={onActionPress}
        style={[styles.action]}
      />
    ) : null}
  </View>
);

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  containerCompact: {
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  art: {
    marginBottom: 20,
  },
  artCompact: {
    marginBottom: 12,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  iconCircleCompact: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: "300",
    color: Colors.black,
    marginBottom: 8,
    textAlign: "center",
  },
  titleCompact: {
    fontSize: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.mutedFont,
    textAlign: "center",
    lineHeight: 20,
  },
  subtitleCompact: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  action: {
    marginTop: 24,
    minWidth: 200,
  },
});
