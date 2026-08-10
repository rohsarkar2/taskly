import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../configs/Colors";

type ListRowProps = {
  icon: string;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  showChevron?: boolean;
  destructive?: boolean;
  style?: ViewStyle;
};

const ListRow: React.FC<ListRowProps> = ({
  icon,
  title,
  subtitle,
  value,
  onPress,
  right,
  showChevron = true,
  destructive = false,
  style,
}) => {
  const tint = destructive ? Colors.danger : Colors.primary;

  return (
    <TouchableOpacity
      style={[styles.row, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: `${tint}14` }]}>
        <Ionicons name={icon} size={19} color={tint} />
      </View>

      <View style={styles.text}>
        <Text style={[styles.title, destructive && styles.titleDestructive]}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {value ? <Text style={styles.value}>{value}</Text> : null}
      {right}
      {!right && showChevron && onPress ? (
        <Ionicons name="chevron-forward" size={18} color={Colors.mutedFont} />
      ) : null}
    </TouchableOpacity>
  );
};

export default ListRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.black,
  },
  titleDestructive: {
    color: Colors.danger,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.mutedFont,
    marginTop: 2,
  },
  value: {
    fontSize: 14,
    color: Colors.lightFont,
  },
});
