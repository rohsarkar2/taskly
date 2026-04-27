import React, { Fragment } from "react";
import { StatusBar, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "../configs/Colors";
import Constant from "../configs/Constant";

type ContainerProps = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  statusBarStyle?: "dark-content" | "light-content";
  statusBarBackgroundColor?: string;
  translucent?: boolean;
};

function Container({
  children,
  style,
  statusBarStyle = "dark-content",
  statusBarBackgroundColor = Colors.white,
  translucent = false,
}: ContainerProps) {
  return (
    <Fragment>
      <SafeAreaView style={[styles.container, style]}>
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={statusBarBackgroundColor}
          translucent={translucent}
        />
        {children}
      </SafeAreaView>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    width: Constant.WINDOW_WIDTH,
    height: Constant.WINDOW_HEIGHT,
    backgroundColor: Colors.white, // Updated to use design system surface color
  },
});

export default Container;
