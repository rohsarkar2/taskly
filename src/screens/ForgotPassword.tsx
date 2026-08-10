import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
import { ForgotPasswordScreenProps } from "../navigation/NavigationTypes";

const ForgotPassword: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    setError(undefined);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 600);
  };

  if (sent) {
    return (
      <Container>
        <Header title="Check your email" showBack />
        <WhiteContainer style={styles.container}>
          <View style={styles.confirmation}>
            <View style={styles.confirmIcon}>
              <Ionicons
                name="mail-open-outline"
                size={44}
                color={Colors.primary}
              />
            </View>
            <Text style={styles.confirmTitle}>Reset link sent</Text>
            <Text style={styles.confirmBody}>
              If an account exists with this email, we have sent a password
              reset link to{"\n"}
              <Text style={styles.email}>{email}</Text>
            </Text>

            <Button
              title="Open reset screen"
              onPress={() => navigation.navigate("ResetPassword", { email })}
              style={[styles.confirmAction]}
            />
            <TouchableOpacity
              onPress={() => navigation.navigate("SignIn")}
              activeOpacity={0.7}
            >
              <Text style={styles.backLink}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </WhiteContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header title="Forgot Password" showBack />
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
              <Ionicons name="key-outline" size={34} color={Colors.primary} />
            </View>

            <Text style={styles.title}>Reset your password</Text>
            <Text style={styles.subtitle}>
              Enter the email you use for Taskly and we'll send you a link to
              set a new password.
            </Text>

            <Input
              label="Email"
              icon="mail-outline"
              placeholder="you@company.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={error}
            />

            <Button
              title="Send Reset Link"
              onPress={handleSubmit}
              loading={loading}
            />

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.backLink}>Back to Sign In</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </WhiteContainer>
    </Container>
  );
};

export default ForgotPassword;

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
  backButton: {
    alignSelf: "center",
    marginTop: 24,
  },
  backLink: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  confirmation: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 60,
  },
  confirmIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  confirmTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: Colors.black,
  },
  confirmBody: {
    fontSize: 14,
    color: Colors.mutedFont,
    textAlign: "center",
    lineHeight: 21,
    marginTop: 10,
    paddingHorizontal: 8,
  },
  email: {
    color: Colors.secondaryFont,
    fontWeight: "600",
  },
  confirmAction: {
    marginTop: 28,
    marginBottom: 16,
    minWidth: 240,
  },
});
