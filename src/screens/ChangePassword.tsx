import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  Button,
  Container,
  Header,
  Input,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import Constant from "../configs/Constant";
import { ChangePasswordScreenProps } from "../navigation/NavigationTypes";

const ChangePassword: React.FC<ChangePasswordScreenProps> = ({
  navigation,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    current?: string;
    next?: string;
    confirm?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const passwordRules = Constant.PASSWORD_RULES.map((rule) => {
    const checks: Record<string, boolean> = {
      "1": newPassword.length >= 8,
      "2": /[A-Z]/.test(newPassword),
      "3": /[a-z]/.test(newPassword),
      "4": /[0-9]/.test(newPassword),
      "5": /[^A-Za-z0-9]/.test(newPassword),
    };
    return { ...rule, isMatched: checks[rule.id] ?? false };
  });

  const handleSubmit = () => {
    const nextErrors: typeof errors = {};

    if (!currentPassword) {
      nextErrors.current = "Enter your current password";
    }
    if (passwordRules.some((rule) => !rule.isMatched)) {
      nextErrors.next = "Password does not meet all requirements";
    }
    if (newPassword !== confirmPassword) {
      nextErrors.confirm = "Passwords do not match";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      Alert.alert("Password changed", "Use your new password next time.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }, 700);
  };

  return (
    <Container>
      <Header title="Change Password" showBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <WhiteContainer style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Input
              label="Current Password"
              icon="lock-closed-outline"
              placeholder="Enter your current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              isPassword
              autoCapitalize="none"
              error={errors.current}
            />

            <Input
              label="New Password"
              icon="key-outline"
              placeholder="Enter a new password"
              value={newPassword}
              onChangeText={setNewPassword}
              isPassword
              autoCapitalize="none"
              error={errors.next}
            />

            <View style={styles.rules}>
              {passwordRules.map((rule) => (
                <View key={rule.id} style={styles.rule}>
                  <Ionicons
                    name={
                      rule.isMatched ? "checkmark-circle" : "ellipse-outline"
                    }
                    size={15}
                    color={rule.isMatched ? Colors.success : Colors.mutedFont}
                  />
                  <Text
                    style={[
                      styles.ruleText,
                      rule.isMatched && styles.ruleTextMatched,
                    ]}
                  >
                    {rule.name}
                  </Text>
                </View>
              ))}
            </View>

            <Input
              label="Confirm New Password"
              icon="key-outline"
              placeholder="Re-enter the new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              autoCapitalize="none"
              error={errors.confirm}
            />

            <View style={styles.notice}>
              <Ionicons
                name="information-circle-outline"
                size={17}
                color={Colors.primary}
              />
              <Text style={styles.noticeText}>
                Changing your password signs you out of every other device.
              </Text>
            </View>

            <Button
              title="Update Password"
              onPress={handleSubmit}
              loading={loading}
              style={[styles.submit]}
            />
          </ScrollView>
        </WhiteContainer>
      </KeyboardAvoidingView>
    </Container>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  content: {
    paddingBottom: 48,
  },
  rules: {
    marginTop: -8,
    marginBottom: 20,
    gap: 6,
  },
  rule: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ruleText: {
    fontSize: 12,
    color: Colors.mutedFont,
  },
  ruleTextMatched: {
    color: Colors.success,
  },
  notice: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 13,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: Colors.secondaryFont,
    lineHeight: 18,
  },
  submit: {
    marginTop: 28,
  },
});
