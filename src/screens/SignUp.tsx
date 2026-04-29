import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Container, Header, WhiteContainer, Button } from "../components";
import Colors from "../configs/Colors";
import { SignUpScreenProps } from "../navigation/NavigationTypes";
import UserService from "../services/UserService";
import { saveAccessToken, saveRefreshToken } from "../utils/Utils";
import { useAppDispatch } from "../store/hooks";
import { setUserData } from "../store/slices/userSlice";

const SignUp: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useAppDispatch();

  const handleSignUp = async () => {
    setLoading(true);

    try {
      let requestBody = {
        name,
        email,
        password,
        confirmPassword,
      };

      const response = await UserService.registerUser(requestBody);

      if (response) {
        const userData = response.user;
        const accessToken = userData.accessToken;
        const refreshToken = userData.refreshToken;

        // Save tokens securely
        await saveAccessToken(accessToken);
        await saveRefreshToken(refreshToken);

        // Update user data in Redux store
        dispatch(setUserData(userData));

        setTimeout(() => {
          navigation.pop(1);
        }, 350);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error during registration:", error);
      setLoading(false);
    }
  };

  const navigateToSignIn = () => {
    navigation.navigate("SignIn");
  };

  return (
    <Container>
      <Header title="Sign Up" showBack />
      <WhiteContainer style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              {/* Logo/Icon Section */}
              <View style={styles.logoSection}>
                <View style={styles.logoContainer}>
                  <Text style={styles.logoText}>T</Text>
                </View>
                <Text style={styles.welcomeText}>Create Account</Text>
                <Text style={styles.subtitleText}>
                  Sign up to start managing your tasks
                </Text>
              </View>

              {/* Form Section */}
              <View style={styles.formSection}>
                {/* Name Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Full Name</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={Colors.mutedFont}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your name"
                      placeholderTextColor={Colors.mutedFont}
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={Colors.mutedFont}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor={Colors.mutedFont}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={Colors.mutedFont}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Create a password"
                      placeholderTextColor={Colors.mutedFont}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color={Colors.mutedFont}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={Colors.mutedFont}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Confirm your password"
                      placeholderTextColor={Colors.mutedFont}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={
                          showConfirmPassword
                            ? "eye-outline"
                            : "eye-off-outline"
                        }
                        size={20}
                        color={Colors.mutedFont}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Sign Up Button */}
                <Button
                  title="Sign Up"
                  onPress={handleSignUp}
                  style={[styles.signUpButton]}
                />

                {/* Sign In Link */}
                <View style={styles.signInSection}>
                  <Text style={styles.signInText}>
                    Already have an account?{" "}
                  </Text>
                  <TouchableOpacity onPress={navigateToSignIn}>
                    <Text style={styles.signInLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
    paddingHorizontal: 16,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
    fontWeight: "700",
    color: Colors.white,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 15,
    color: Colors.mutedFont,
  },
  formSection: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.black,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    padding: 4,
  },
  signUpButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  signInSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
