import React, { useState } from "react";
import {
  Alert,
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
  PasswordRules,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import { SignUpScreenProps } from "../navigation/NavigationTypes";
import UserService from "../services/UserService";
import { useAppDispatch } from "../store/hooks";
import { setOrganizationData } from "../store/slices/organizationSlice";
import { setUserData } from "../store/slices/userSlice";
import { isPasswordValid } from "../utils/Formatters";
import { mapApiOrganization, mapAuthResponse } from "../utils/Mappers";
import { saveAccessToken, saveRefreshToken } from "../utils/Utils";

type FormErrors = Partial<
  Record<
    | "organizationId"
    | "name"
    | "email"
    | "phone"
    | "password"
    | "confirmPassword",
    string
  >
>;

const SignUp: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [organizationId, setOrganizationId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!organizationId.trim()) {
      nextErrors.organizationId = "Enter the ID your admin shared with you";
    }
    if (!name.trim()) {
      nextErrors.name = "Enter your full name";
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = "Enter a valid email address";
    }
    if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
      nextErrors.phone = "Enter a valid phone number";
    }
    if (!isPasswordValid(password)) {
      nextErrors.password = "Password does not meet all requirements";
    }
    if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // Every employee registers as a pending Team Member — the admin decides the
  // final role from Taskly Admin. Organizations with auto-approval turned on
  // come back active instead, and skip the waiting screen.
  const handleSignUp = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const response = await UserService.registerUser({
        uniqueOrganizationId: organizationId.trim(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phoneNumber: phone.trim(),
      });

      const userData = mapAuthResponse(response?.data);

      await saveAccessToken(userData.accessToken);
      await saveRefreshToken(userData.refreshToken);
      dispatch(setUserData(userData));

      if (response?.data?.organization) {
        dispatch(
          setOrganizationData(mapApiOrganization(response.data.organization)),
        );
      }

      if (userData.status === "active") {
        navigation.replace("MainTabs", { screen: "Home" });
        return;
      }

      navigation.replace("PendingApproval");
    } catch (error: any) {
      Alert.alert(
        "Registration failed",
        error?.message ?? "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header title="Create Account" showBack />
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
            <Text style={styles.intro}>
              Join your organization on Taskly. Your admin approves the account
              and assigns your role.
            </Text>

            <Input
              label="Organization ID"
              icon="business-outline"
              placeholder="ACME-482913"
              value={organizationId}
              onChangeText={setOrganizationId}
              autoCapitalize="characters"
              error={errors.organizationId}
              hint="Ask your administrator for this ID"
            />

            <Input
              label="Full Name"
              icon="person-outline"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              error={errors.name}
            />

            <Input
              label="Email"
              icon="mail-outline"
              placeholder="you@company.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Phone"
              icon="call-outline"
              placeholder="+1234567890"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
              error={errors.phone}
            />

            <Input
              label="Password"
              icon="lock-closed-outline"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              isPassword
              autoCapitalize="none"
              error={errors.password}
            />

            {password.length > 0 ? (
              <PasswordRules password={password} style={styles.rules} />
            ) : null}

            <Input
              label="Confirm Password"
              icon="lock-closed-outline"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              autoCapitalize="none"
              error={errors.confirmPassword}
            />

            <View style={styles.roleNotice}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={Colors.primary}
              />
              <Text style={styles.roleNoticeText}>
                You'll join as a Team Member. Your admin can promote you to Team
                Lead or Manager later.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.terms}
              onPress={() => setAgreeToTerms((agreed) => !agreed)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={agreeToTerms ? "checkbox" : "square-outline"}
                size={20}
                color={agreeToTerms ? Colors.primary : Colors.mutedFont}
              />
              <Text style={styles.termsText}>
                I agree to the Terms of Service and Privacy Policy
              </Text>
            </TouchableOpacity>

            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={loading}
              disabled={!agreeToTerms}
            />

            <View style={styles.signInRow}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("SignIn")}
                activeOpacity={0.7}
              >
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </WhiteContainer>
    </Container>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingBottom: 48,
  },
  intro: {
    fontSize: 14,
    color: Colors.mutedFont,
    lineHeight: 20,
    marginBottom: 24,
  },
  rules: {
    marginTop: -8,
    marginBottom: 18,
  },
  roleNotice: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  roleNoticeText: {
    flex: 1,
    fontSize: 13,
    color: Colors.secondaryFont,
    lineHeight: 19,
  },
  terms: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: Colors.lightFont,
  },
  signInRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  signInText: {
    fontSize: 14,
    color: Colors.mutedFont,
  },
  signInLink: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
});
