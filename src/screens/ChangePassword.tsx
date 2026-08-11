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
  PasswordRules,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import { ChangePasswordScreenProps } from "../navigation/NavigationTypes";
import UserService from "../services/UserService";
import { useAppDispatch } from "../store/hooks";
import { clearOrganizationData } from "../store/slices/organizationSlice";
import { clearUserData } from "../store/slices/userSlice";
import { isPasswordValid } from "../utils/Formatters";
import { clearAllTokens } from "../utils/Utils";

const ChangePassword: React.FC<ChangePasswordScreenProps> = ({
  navigation,
}) => {
  const dispatch = useAppDispatch();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    current?: string;
    next?: string;
    confirm?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const nextErrors: typeof errors = {};

    if (!currentPassword) {
      nextErrors.current = "Enter your current password";
    }
    if (!isPasswordValid(newPassword)) {
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

    try {
      await UserService.changePassword({ currentPassword, newPassword });

      // The API terminates every session on success, so this one is already
      // dead — drop the local state and send them back to sign in. No logout
      // call: the tokens it would use have just been revoked.
      await clearAllTokens().catch(() => {});
      dispatch(clearUserData());
      dispatch(clearOrganizationData());

      Alert.alert(
        "Password changed",
        "Please log in again with your new password.",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.reset({ index: 0, routes: [{ name: "SignIn" }] }),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        "Couldn't change your password",
        error?.message ?? "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
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

            <PasswordRules password={newPassword} style={styles.rules} />

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
                Changing your password signs you out on every device, including
                this one.
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
