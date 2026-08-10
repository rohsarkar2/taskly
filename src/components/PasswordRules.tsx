import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../configs/Colors";
import { getPasswordRules } from "../utils/Formatters";

type PasswordRulesProps = {
  password: string;
  style?: ViewStyle;
};

const PasswordRules: React.FC<PasswordRulesProps> = ({ password, style }) => (
  <View style={[styles.list, style]}>
    {getPasswordRules(password).map((rule) => (
      <View key={rule.id} style={styles.rule}>
        <Ionicons
          name={rule.isMatched ? "checkmark-circle" : "ellipse-outline"}
          size={15}
          color={rule.isMatched ? Colors.success : Colors.mutedFont}
        />
        <Text style={[styles.text, rule.isMatched && styles.textMatched]}>
          {rule.name}
        </Text>
      </View>
    ))}
  </View>
);

export default PasswordRules;

const styles = StyleSheet.create({
  list: {
    gap: 6,
  },
  rule: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    fontSize: 12,
    color: Colors.mutedFont,
  },
  textMatched: {
    color: Colors.success,
  },
});
