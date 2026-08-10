import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../configs/Colors";
import Button from "./Button";

type EmptyStateProps = {
  icon: string;
  title: string;
  subtitle?: string;
  actionTitle?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
};

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  actionTitle,
  onActionPress,
  style,
}) => (
  <View style={[styles.container, style]}>
    <View style={styles.iconCircle}>
      <Ionicons name={icon} size={44} color={Colors.primary} />
    </View>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
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
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.mutedFont,
    textAlign: "center",
    lineHeight: 20,
  },
  action: {
    marginTop: 24,
    minWidth: 200,
  },
});
