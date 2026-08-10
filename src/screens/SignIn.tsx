import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  Container,
  Header,
  Input,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import { currentUser } from "../data";
import { SignInScreenProps } from "../navigation/NavigationTypes";
import { useAppDispatch } from "../store/hooks";
import { setUserData } from "../store/slices/userSlice";

const SignIn: React.FC<SignInScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = () => {
    setLoading(true);

    // Static build: accept anything and drop into the app as the demo user.
    setTimeout(() => {
      setLoading(false);
      dispatch(
        setUserData({ ...currentUser, email: email || currentUser.email })
      );
      navigation.replace("MainTabs", { screen: "Home" });
    }, 600);
  };

  return (
    <Container>
      <Header title="Sign In" showBack />
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
            <View style={styles.logoSection}>
              <Image
                source={require("../assets/images/taskly-icon.png")}
                style={styles.logo}
              />
              <Text style={styles.welcome}>Welcome back</Text>
              <Text style={styles.subtitle}>
                Sign in to pick up where you left off
              </Text>
            </View>

            <Input
              label="Email"
              icon="mail-outline"
              placeholder="you@company.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              label="Password"
              icon="lock-closed-outline"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              isPassword
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.forgot}
              onPress={() => navigation.navigate("ForgotPassword")}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <Button title="Sign In" onPress={handleSignIn} loading={loading} />

            <View style={styles.signUpRow}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("SignUp")}
                activeOpacity={0.7}
              >
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </WhiteContainer>
    </Container>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 88,
    height: 88,
    resizeMode: "contain",
  },
  welcome: {
    fontSize: 23,
    fontWeight: "700",
    color: Colors.black,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.mutedFont,
    marginTop: 6,
  },
  forgot: {
    alignSelf: "flex-end",
    marginBottom: 24,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.primary,
  },
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  signUpText: {
    fontSize: 14,
    color: Colors.mutedFont,
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
});
