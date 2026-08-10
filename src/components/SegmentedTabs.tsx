import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Colors from "../configs/Colors";

export type TabItem<T extends string> = {
  key: T;
  label: string;
  count?: number;
};

type SegmentedTabsProps<T extends string> = {
  tabs: TabItem<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  scrollable?: boolean;
  style?: ViewStyle;
};

function SegmentedTabs<T extends string>({
  tabs,
  activeKey,
  onChange,
  scrollable = false,
  style,
}: SegmentedTabsProps<T>) {
  const renderTab = (tab: TabItem<T>) => {
    const isActive = tab.key === activeKey;

    return (
      <TouchableOpacity
        key={tab.key}
        style={[
          styles.tab,
          scrollable ? styles.tabScrollable : styles.tabFlex,
          isActive && styles.tabActive,
        ]}
        onPress={() => onChange(tab.key)}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
          {tab.label}
          {typeof tab.count === "number" ? ` (${tab.count})` : ""}
        </Text>
      </TouchableOpacity>
    );
  };

  if (scrollable) {
    return (
      <View style={[styles.container, style]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {tabs.map(renderTab)}
        </ScrollView>
      </View>
    );
  }

  return <View style={[styles.container, style]}>{tabs.map(renderTab)}</View>;
}

export default SegmentedTabs;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.leaderboardBorderVeryLight,
  },
  scrollContent: {
    paddingRight: 16,
  },
  tab: {
    paddingBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabFlex: {
    flex: 1,
  },
  tabScrollable: {
    paddingHorizontal: 14,
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.lightFont,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: "600",
  },
});
