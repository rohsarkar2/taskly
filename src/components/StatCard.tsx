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

type StatCardProps = {
  icon: string;
  label: string;
  value: number | string;
  color: string;
  caption?: string;
  onPress?: () => void;
  style?: ViewStyle;
};

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  color,
  caption,
  onPress,
  style,
}) => (
  <TouchableOpacity
    style={[styles.card, style]}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    disabled={!onPress}
  >
    <View style={[styles.iconWrapper, { backgroundColor: `${color}1A` }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
    {caption ? <Text style={styles.caption}>{caption}</Text> : null}
  </TouchableOpacity>
);

export default StatCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderGray,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  value: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.black,
    letterSpacing: -0.8,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.lightFont,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 2,
  },
  caption: {
    fontSize: 11,
    color: Colors.mutedFont,
    marginTop: 4,
  },
});
