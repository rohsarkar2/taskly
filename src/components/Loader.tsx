import React from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  ViewStyle,
  Text,
  TextStyle,
} from "react-native";
import Colors from "../configs/Colors";

interface LoaderProps {
  size?: "small" | "large" | number;
  color?: string;
  style?: ViewStyle;
  animating?: boolean;
  text?: string;
  textStyle?: TextStyle;
  fullScreen?: boolean;
  backgroundColor?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = "small",
  color = Colors.primary,
  style,
  animating = true,
  text,
  textStyle,
  fullScreen = false,
  backgroundColor = "transparent",
}) => {
  const containerStyle = fullScreen
    ? [styles.fullScreenContainer, { backgroundColor }]
    : [styles.container, style];

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} animating={animating} />
      {text && <Text style={[styles.text, { color }, textStyle]}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  fullScreenContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  text: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
  },
});

export default Loader;
