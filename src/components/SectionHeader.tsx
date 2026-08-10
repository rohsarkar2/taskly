import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Colors from "../configs/Colors";

type SectionHeaderProps = {
  title: string;
  actionTitle?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
};

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionTitle,
  onActionPress,
  style,
}) => (
  <View style={[styles.container, style]}>
    <Text style={styles.title}>{title}</Text>
    {actionTitle && onActionPress ? (
      <TouchableOpacity onPress={onActionPress} activeOpacity={0.7}>
        <Text style={styles.action}>{actionTitle}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

export default SectionHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.black,
  },
  action: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
});
