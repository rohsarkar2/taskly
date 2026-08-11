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
import { UserRole } from "../models/user";
import { getUserRoleMeta } from "../utils/Formatters";
import Avatar from "./Avatar";
import Badge from "./Badge";

/** Wide enough for both a full UserModel and a project member row. */
export type MemberRowPerson = {
  id: string;
  name: string;
  role: UserRole;
  image?: string;
  jobTitle?: string;
};

type MemberRowProps<T extends MemberRowPerson> = {
  member: T;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: (member: T) => void;
  showChevron?: boolean;
  style?: ViewStyle;
};

const MemberRow = <T extends MemberRowPerson>({
  member,
  subtitle,
  right,
  onPress,
  showChevron = false,
  style,
}: MemberRowProps<T>) => (
  <TouchableOpacity
    style={[styles.row, style]}
    onPress={() => onPress?.(member)}
    activeOpacity={onPress ? 0.7 : 1}
    disabled={!onPress}
  >
    <Avatar name={member.name} image={member.image} size={44} />

    <View style={styles.info}>
      <Text style={styles.name} numberOfLines={1}>
        {member.name}
      </Text>
      <Text style={styles.subtitle} numberOfLines={1}>
        {subtitle ?? member.jobTitle}
      </Text>
    </View>

    {right ?? (
      <Badge
        meta={getUserRoleMeta(member.role)}
        size="small"
        style={{ alignSelf: "center" }}
      />
    )}

    {showChevron ? (
      <Ionicons
        name="chevron-forward"
        size={18}
        color={Colors.mutedFont}
        style={styles.chevron}
      />
    ) : null}
  </TouchableOpacity>
);

export default MemberRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.mutedFont,
    marginTop: 2,
  },
  chevron: {
    marginLeft: 4,
  },
});
