import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../configs/Colors";

type InputProps = TextInputProps & {
  label?: string;
  icon?: string;
  error?: string;
  hint?: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
};

const Input: React.FC<InputProps> = ({
  label,
  icon,
  error,
  hint,
  isPassword = false,
  containerStyle,
  style,
  multiline,
  ...inputProps
}) => {
  const [isSecure, setIsSecure] = useState(isPassword);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          Boolean(error) && styles.fieldError,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={20}
            color={Colors.mutedFont}
            style={styles.icon}
          />
        ) : null}

        <TextInput
          style={[styles.input, multiline && styles.inputMultiline, style]}
          placeholderTextColor={Colors.mutedFont}
          secureTextEntry={isSecure}
          multiline={multiline}
          {...inputProps}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setIsSecure((secure) => !secure)}
            style={styles.trailing}
            accessibilityRole="button"
            accessibilityLabel={isSecure ? "Show password" : "Hide password"}
          >
            <Ionicons
              name={isSecure ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={Colors.mutedFont}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 8,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  fieldMultiline: {
    height: "auto",
    minHeight: 100,
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  fieldError: {
    borderColor: Colors.danger,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.black,
    padding: 0,
  },
  inputMultiline: {
    textAlignVertical: "top",
    minHeight: 76,
  },
  trailing: {
    padding: 4,
  },
  error: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 6,
  },
  hint: {
    fontSize: 12,
    color: Colors.mutedFont,
    marginTop: 6,
  },
});
