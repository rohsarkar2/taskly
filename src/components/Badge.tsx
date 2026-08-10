import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { BadgeMeta } from "../utils/Formatters";

type BadgeProps = {
  meta: BadgeMeta;
  icon?: string;
  size?: "small" | "medium";
  style?: ViewStyle;
  textStyle?: TextStyle;
};

const Badge: React.FC<BadgeProps> = ({
  meta,
  icon,
  size = "medium",
  style,
  textStyle,
}) => {
  const isSmall = size === "small";

  return (
    <View
      style={[
        styles.badge,
        isSmall ? styles.badgeSmall : styles.badgeMedium,
        { backgroundColor: meta.background },
        style,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={isSmall ? 11 : 13}
          color={meta.color}
          style={styles.icon}
        />
      ) : null}
      <Text
        style={[
          styles.text,
          isSmall ? styles.textSmall : styles.textMedium,
          { color: meta.color },
          textStyle,
        ]}
      >
        {meta.label}
      </Text>
    </View>
  );
};

export default Badge;

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 999,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeMedium: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: "600",
  },
  textSmall: {
    fontSize: 11,
  },
  textMedium: {
    fontSize: 12,
  },
});
