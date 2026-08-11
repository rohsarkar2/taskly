import React, { useEffect, useRef, useState } from "react";
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
  OtpInput,
  PasswordRules,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import { ForgotPasswordScreenProps } from "../navigation/NavigationTypes";
import UserService from "../services/UserService";
import { isPasswordValid } from "../utils/Formatters";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const STEPS = [
  { key: "email", label: "Email" },
  { key: "otp", label: "Verify" },
  { key: "password", label: "Password" },
] as const;

type StepIndex = 0 | 1 | 2;

const ForgotPassword: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const [step, setStep] = useState<StepIndex>(0);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();

  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | undefined>();
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmError, setConfirmError] = useState<string | undefined>();

  // Handed out by verify-reset-otp and consumed by reset-password. Single use,
  // 15 minutes, and a fresh OTP request invalidates it.
  const [resetToken, setResetToken] = useState("");

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Resend countdown only runs while the OTP step is on screen.
  useEffect(() => {
    if (step !== 1) {
      return;
    }

    timer.current = setInterval(() => {
      setSecondsLeft((seconds) => (seconds > 0 ? seconds - 1 : 0));
    }, 1000);

    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, [step]);

  // Always resolves 200, whether or not the email is registered — the response
  // deliberately reveals nothing, so the UI just moves on to the code step.
  const requestCode = async () => {
    const response = await UserService.forgotPassword({
      email: email.trim().toLowerCase(),
    });

    setCode("");
    setCodeError(undefined);
    // Any token from an earlier verification is dead once a new OTP is issued.
    setResetToken("");
    setSecondsLeft(RESEND_SECONDS);

    return response;
  };

  const handleSendCode = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError("Enter a valid email address");
      return;
    }

    setEmailError(undefined);
    setLoading(true);

    try {
      await requestCode();
      setStep(1);
    } catch (error: any) {
      Alert.alert(
        "Couldn't send the code",
        error?.message ?? "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length < OTP_LENGTH) {
      setCodeError(`Enter all ${OTP_LENGTH} digits`);
      return;
    }

    setCodeError(undefined);
    setLoading(true);

    try {
      const response = await UserService.verifyResetOtp({
        email: email.trim().toLowerCase(),
        otp: code,
      });

      const token = response?.data?.resetToken;

      if (!token) {
        throw new Error("The verification code is invalid or has expired");
      }

      setResetToken(token);
      setStep(2);
    } catch (error: any) {
      // Wrong code, expired code, or the attempt budget is spent — the API
      // answers identically for all three, so show its message as-is.
      setCodeError(error?.message ?? "The verification code is invalid");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || loading) {
      return;
    }

    setLoading(true);

    try {
      await requestCode();
      Alert.alert("Code sent", `We sent a new code to ${email}.`);
    } catch (error: any) {
      Alert.alert(
        "Couldn't send the code",
        error?.message ?? "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const nextPasswordError = isPasswordValid(password)
      ? undefined
      : "Password does not meet all requirements";
    const nextConfirmError =
      password === confirmPassword ? undefined : "Passwords do not match";

    setPasswordError(nextPasswordError);
    setConfirmError(nextConfirmError);

    if (nextPasswordError || nextConfirmError) {
      return;
    }

    setLoading(true);

    try {
      const response = await UserService.resetPassword({
        token: resetToken,
        newPassword: password,
      });

      Alert.alert(
        "Password updated",
        response?.message ??
          "Your password has been changed. Sign in with your new password.",
        [{ text: "OK", onPress: () => navigation.navigate("SignIn") }],
      );
    } catch (error: any) {
      // The token is single-use and only lives 15 minutes. Once it's spent or
      // expired there is nothing to retry on this step — send them back to the
      // start for a new code.
      Alert.alert(
        "Couldn't reset your password",
        error?.message ?? "Something went wrong. Please try again.",
        [
          {
            text: "Start over",
            onPress: () => {
              setResetToken("");
              setPassword("");
              setConfirmPassword("");
              setStep(0);
            },
          },
        ],
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 0) {
      navigation.goBack();
      return;
    }

    setCodeError(undefined);
    setPasswordError(undefined);
    setConfirmError(undefined);
    setStep((current) => (current - 1) as StepIndex);
  };

  const renderStepIndicator = () => (
    <View style={styles.stepper}>
      {STEPS.map((item, index) => {
        const isDone = index < step;
        const isCurrent = index === step;

        return (
          <React.Fragment key={item.key}>
            {index > 0 ? (
              <View style={[styles.stepLine, isDone && styles.stepLineDone]} />
            ) : null}
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  isCurrent && styles.stepCircleCurrent,
                  isDone && styles.stepCircleDone,
                ]}
              >
                {isDone ? (
                  <Ionicons name="checkmark" size={15} color={Colors.white} />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      isCurrent && styles.stepNumberCurrent,
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  (isCurrent || isDone) && styles.stepLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );

  const renderEmailStep = () => (
    <>
      <View style={styles.iconCircle}>
        <Ionicons name="mail-outline" size={32} color={Colors.primary} />
      </View>
      <Text style={styles.title}>What's your email?</Text>
      <Text style={styles.subtitle}>
        We'll send a {OTP_LENGTH}-digit verification code to your Taskly email.
      </Text>

      <Input
        label="Email"
        icon="mail-outline"
        placeholder="you@company.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={emailError}
      />

      <Button title="Send Code" onPress={handleSendCode} loading={loading} />
    </>
  );

  const renderOtpStep = () => (
    <>
      <View style={styles.iconCircle}>
        <Ionicons
          name="shield-checkmark-outline"
          size={32}
          color={Colors.primary}
        />
      </View>
      <Text style={styles.title}>Enter the code</Text>
      <Text style={styles.subtitle}>
        We sent a {OTP_LENGTH}-digit code to{"\n"}
        <Text style={styles.email}>{email}</Text>
      </Text>

      <OtpInput
        value={code}
        onChange={(next) => {
          setCode(next);
          setCodeError(undefined);
        }}
        length={OTP_LENGTH}
        hasError={Boolean(codeError)}
        autoFocus
        style={styles.otp}
      />

      {codeError ? <Text style={styles.error}>{codeError}</Text> : null}

      <View style={styles.resendRow}>
        <Text style={styles.resendText}>Didn't get the code? </Text>
        <TouchableOpacity
          onPress={handleResend}
          disabled={secondsLeft > 0}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.resendLink,
              secondsLeft > 0 && styles.resendLinkDisabled,
            ]}
          >
            {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend"}
          </Text>
        </TouchableOpacity>
      </View>

      <Button
        title="Verify Code"
        onPress={handleVerifyCode}
        loading={loading}
        style={[styles.verifyButton]}
      />

      <TouchableOpacity
        style={styles.changeEmail}
        onPress={() => setStep(0)}
        activeOpacity={0.7}
      >
        <Text style={styles.changeEmailText}>Use a different email</Text>
      </TouchableOpacity>
    </>
  );

  const renderPasswordStep = () => (
    <>
      <View style={styles.iconCircle}>
        <Ionicons name="lock-open-outline" size={32} color={Colors.primary} />
      </View>
      <Text style={styles.title}>Set a new password</Text>
      <Text style={styles.subtitle}>
        Choose a password you haven't used before.
      </Text>

      <Input
        label="New Password"
        icon="lock-closed-outline"
        placeholder="Enter a new password"
        value={password}
        onChangeText={setPassword}
        isPassword
        autoCapitalize="none"
        error={passwordError}
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
        error={confirmError}
      />

      <Button
        title="Reset Password"
        onPress={handleResetPassword}
        loading={loading}
      />
    </>
  );

  return (
    <Container>
      <Header title="Forgot Password" showBack onBackPress={handleBack} />
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
            {renderStepIndicator()}

            {step === 0 ? renderEmailStep() : null}
            {step === 1 ? renderOtpStep() : null}
            {step === 2 ? renderPasswordStep() : null}

            <TouchableOpacity
              style={styles.backToSignIn}
              onPress={() => navigation.navigate("SignIn")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-back-outline"
                size={16}
                color={Colors.primary}
              />
              <Text style={styles.backLink}>Back to Sign In</Text>
            </TouchableOpacity>
          </ScrollView>
        </WhiteContainer>
      </KeyboardAvoidingView>
    </Container>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  content: {
    paddingBottom: 40,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: 32,
  },
  stepItem: {
    alignItems: "center",
    width: 72,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.leaderboardBorderVeryLight,
  },
  stepCircleCurrent: {
    backgroundColor: Colors.secondary,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  stepCircleDone: {
    backgroundColor: Colors.primary,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.mutedFont,
  },
  stepNumberCurrent: {
    color: Colors.primary,
  },
  stepLabel: {
    fontSize: 11,
    color: Colors.mutedFont,
    marginTop: 6,
  },
  stepLabelActive: {
    color: Colors.primary,
    fontWeight: "600",
  },
  stepLine: {
    height: 1.5,
    flex: 1,
    maxWidth: 40,
    backgroundColor: Colors.leaderboardBorderVeryLight,
    marginTop: 13,
    marginHorizontal: -10,
  },
  stepLineDone: {
    backgroundColor: Colors.primary,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
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
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 28,
  },
  email: {
    color: Colors.secondaryFont,
    fontWeight: "600",
  },
  otp: {
    marginBottom: 8,
  },
  error: {
    fontSize: 12,
    color: Colors.danger,
    textAlign: "center",
    marginTop: 4,
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  resendText: {
    fontSize: 13,
    color: Colors.mutedFont,
  },
  resendLink: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
  },
  resendLinkDisabled: {
    color: Colors.mutedFont,
    fontWeight: "500",
  },
  verifyButton: {
    marginTop: 28,
  },
  changeEmail: {
    alignSelf: "center",
    marginTop: 16,
  },
  changeEmailText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.lightFont,
  },
  rules: {
    marginTop: -8,
    marginBottom: 20,
  },
  backToSignIn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "center",
    marginTop: 20,
  },
  backLink: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
});
