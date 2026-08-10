import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Colors from "../configs/Colors";

type ProgressBarProps = {
  progress: number; // 0 - 100
  color?: string;
  trackColor?: string;
  height?: number;
  style?: ViewStyle;
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = Colors.primary,
  trackColor = Colors.leaderboardBorderVeryLight,
  height = 6,
  style,
}) => {
  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: height / 2, backgroundColor: trackColor },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clamped}%`,
            backgroundColor: color,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
};

export default ProgressBar;

const styles = StyleSheet.create({
  track: {
    width: "100%",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
});
