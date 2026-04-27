import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import Colors from "../configs/Colors";

type ButtonVariant = "primary" | "secondary" | "outline";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  backgroundColor?: string; // For solid color override
  style?: ViewStyle[];
  textStyle?: TextStyle;
};

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  backgroundColor,
  style,
  textStyle,
}) => {
  const renderPrimaryButton = () => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.9}
      style={[
        styles.button,
        styles.primaryButton,
        { backgroundColor: backgroundColor || Colors.primary },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} size="small" />
      ) : (
        <Text style={[styles.primaryButtonText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );

  const renderSecondaryButton = () => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.9}
      style={[styles.button, styles.secondaryButton, style]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.primary} size="small" />
      ) : (
        <Text style={[styles.secondaryButtonText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );

  const renderOutlineButton = () => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[styles.button, styles.outlineButton, style]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} size="small" />
      ) : (
        <Text style={[styles.outlineButtonText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );

  if (variant === "primary") {
    return renderPrimaryButton();
  } else if (variant === "secondary") {
    return renderSecondaryButton();
  } else {
    return renderOutlineButton();
  }
};

export default Button;

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: "hidden",
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  outlineButton: {
    borderWidth: 0.5,
    borderColor: Colors.lightBorder,
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.white,
  },
});
