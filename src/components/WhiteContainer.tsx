import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    paddingHorizontal: 10,
    paddingTop: 20,
  },
});

const WhiteContainer: React.FC<Props> = (props) => (
  <View style={[styles.container, props.style]}>{props.children}</View>
);

export default WhiteContainer;
