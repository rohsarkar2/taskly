import React, { useEffect, useRef, useState } from "react";
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
  ViewStyle,
} from "react-native";
import Colors from "../configs/Colors";

type OtpInputProps = {
  /** Pass "" to clear every box — e.g. after a resend. */
  value: string;
  onChange: (code: string) => void;
  length?: number;
  autoFocus?: boolean;
  hasError?: boolean;
  style?: ViewStyle;
};

const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  length = 6,
  autoFocus = false,
  hasError = false,
  style,
}) => {
  const inputs = useRef<Array<TextInput | null>>([]);
  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length }, (_, index) => value[index] ?? ""),
  );
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Boxes are owned here so clearing a middle digit doesn't shift the rest;
  // the parent only needs the joined code.
  useEffect(() => {
    if (value === "") {
      setDigits(Array.from({ length }, () => ""));
    }
  }, [value, length]);

  const focusAt = (index: number) => {
    if (index >= 0 && index < length) {
      inputs.current[index]?.focus();
    }
  };

  const commit = (next: string[]) => {
    setDigits(next);
    onChange(next.join(""));
  };

  const handleChange = (text: string, index: number) => {
    const cleaned = text.replace(/\D/g, "");
    const next = [...digits];

    if (!cleaned) {
      next[index] = "";
      commit(next);
      return;
    }

    // A paste lands entirely in one box — spread it across the rest.
    cleaned.split("").forEach((digit, offset) => {
      if (index + offset < length) {
        next[index + offset] = digit;
      }
    });

    commit(next);
    focusAt(index + cleaned.length);
  };

  const handleKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (event.nativeEvent.key !== "Backspace" || digits[index]) {
      return;
    }

    // Empty box: step back and clear the previous digit.
    const next = [...digits];
    next[index - 1] = "";
    commit(next);
    focusAt(index - 1);
  };

  return (
    <View style={[styles.row, style]}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(input) => {
            inputs.current[index] = input;
          }}
          style={[
            styles.box,
            Boolean(digit) && styles.boxFilled,
            focusedIndex === index && styles.boxFocused,
            hasError && styles.boxError,
          ]}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(event) => handleKeyPress(event, index)}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(null)}
          keyboardType="number-pad"
          returnKeyType="done"
          maxLength={length}
          selectTextOnFocus
          autoFocus={autoFocus && index === 0}
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          accessibilityLabel={`Digit ${index + 1}`}
        />
      ))}
    </View>
  );
};

export default OtpInput;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  box: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    backgroundColor: Colors.surfaceMuted,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: Colors.black,
    padding: 0,
  },
  boxFilled: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
  },
  boxFocused: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
    backgroundColor: Colors.white,
  },
  boxError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerSoft,
  },
});
