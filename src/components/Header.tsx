import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  Platform,
} from "react-native";
import {
  CompositeNavigationProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../configs/Colors";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  BottomTabsParamList,
  RootStackParamList,
} from "../navigation/NavigationTypes";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

type HeaderProps = {
  title?: string;
  titleComponent?: React.ReactNode;
  right?: React.ReactNode;
  style?: ViewStyle;
  showBack?: boolean;
  onBackPress?: () => void;
  showLogo?: boolean;
};

function Header({
  title,
  titleComponent,
  right,
  style,
  showBack,
  onBackPress,
  showLogo = false,
}: HeaderProps) {
  const navigation: CompositeNavigationProp<
    StackNavigationProp<RootStackParamList>,
    BottomTabNavigationProp<BottomTabsParamList>
  > = useNavigation();
  const route = useRoute();

  // Tab screens where we show logo instead of back button
  const tabScreens = ["Home", "Search", "Activity"];
  const isTabScreen = tabScreens.includes(route.name);

  // Determine if back button should be shown
  const shouldShowBack =
    typeof showBack === "boolean" ? showBack : !isTabScreen;

  // Determine if logo should be shown
  const shouldShowLogo = showLogo || isTabScreen;

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftSection}>
        {shouldShowLogo && !shouldShowBack ? (
          // Logo for tab screens
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>T</Text>
            </View>
          </View>
        ) : shouldShowBack ? (
          // Back button for stack screens
          <Pressable
            onPress={handleBackPress}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={Colors.black} />
          </Pressable>
        ) : null}
      </View>

      <View
        style={[
          styles.middleSection,
          shouldShowBack ? { paddingHorizontal: 0 } : null,
        ]}
      >
        {titleComponent ? (
          titleComponent
        ) : title ? (
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
        ) : null}
      </View>

      <View style={right ? styles.rightSection : styles.rightSlotEmpty}>
        {right || null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
    marginTop: Platform.OS === "android" ? 10 : 0,
  },
  leftSection: {
    width: 38,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.borderGray,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  middleSection: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
    letterSpacing: -0.3,
    width: "80%",
  },
  rightSection: {
    minWidth: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  rightSlotEmpty: {
    width: 0,
    alignItems: "flex-end",
    justifyContent: "center",
  },
});

export default Header;
