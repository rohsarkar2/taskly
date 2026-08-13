import React from "react";
import { ViewStyle } from "react-native";
import EmptyNotificationsArt from "../assets/empty-states/empty-notifications.svg";
import EmptyStateArt from "../assets/empty-states/empty-state.svg";

/**
 * Which artwork an empty state shows. Add a case here and in ILLUSTRATIONS to
 * introduce a new one — screens never reach for the asset directly.
 */
export type EmptyIllustrationName = "default" | "notifications";

const ILLUSTRATIONS: Record<
  EmptyIllustrationName,
  React.FC<{ width: number; height: number; style?: ViewStyle }>
> = {
  default: EmptyStateArt,
  notifications: EmptyNotificationsArt,
};

type EmptyIllustrationProps = {
  name?: EmptyIllustrationName;
  size?: number;
  style?: ViewStyle;
};

// The artwork is square (148x148), so one size drives both dimensions.
const EmptyIllustration: React.FC<EmptyIllustrationProps> = ({
  name = "default",
  size = 148,
  style,
}) => {
  const Art = ILLUSTRATIONS[name];

  return <Art width={size} height={size} style={style} />;
};

export default EmptyIllustration;
