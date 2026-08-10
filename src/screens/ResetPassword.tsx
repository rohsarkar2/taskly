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
import { ResetPasswordScreenProps } from "../navigation/NavigationTypes";
import { isPasswordValid } from "../utils/Formatters";

const ResetPassword: React.FC<ResetPasswordScreenProps> = ({
  navigation,
  route,
}) => {
  const email = route.params?.email;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    if (!isPasswordValid(password)) {
      setError("Password does not meet all requirements");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError(undefined);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Password updated",
        "Your password has been changed. Please sign in with your new password.",
        [{ text: "OK", onPress: () => navigation.navigate("SignIn") }]
      );
    }, 700);
  };

  return (
    <Container>
      <Header title="Reset Password" showBack />
      <WhiteContainer style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.iconCircle}>
              <Ionicons
                name="lock-open-outline"
                size={34}
                color={Colors.primary}
              />
            </View>

            <Text style={styles.title}>Set a new password</Text>
            <Text style={styles.subtitle}>
              {email
                ? `Choose a new password for ${email}.`
                : "Choose a new password for your account."}
            </Text>

            <Input
              label="New Password"
              icon="lock-closed-outline"
              placeholder="Enter a new password"
              value={password}
              onChangeText={setPassword}
              isPassword
              autoCapitalize="none"
            />

            <PasswordRules password={password} style={styles.rules} />

            <Input
              label="Confirm Password"
              icon="lock-closed-outline"
              placeholder="Re-enter the new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              autoCapitalize="none"
              error={error}
            />

            <Button
              title="Update Password"
              onPress={handleReset}
              loading={loading}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </WhiteContainer>
    </Container>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 21,
    fontWeight: "700",
    color: Colors.black,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.mutedFont,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 28,
  },
  rules: {
    marginTop: -8,
    marginBottom: 20,
  },
});
