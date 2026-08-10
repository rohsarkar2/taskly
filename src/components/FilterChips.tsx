import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import Colors from "../configs/Colors";

export type ChipItem<T extends string> = {
  key: T;
  label: string;
};

type FilterChipsProps<T extends string> = {
  chips: ChipItem<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  style?: ViewStyle;
};

function FilterChips<T extends string>({
  chips,
  activeKey,
  onChange,
  style,
}: FilterChipsProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.content, style]}
    >
      {chips.map((chip) => {
        const isActive = chip.key === activeKey;

        return (
          <TouchableOpacity
            key={chip.key}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onChange(chip.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default FilterChips;

const styles = StyleSheet.create({
  content: {
    paddingVertical: 4,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    backgroundColor: Colors.white,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.lightFont,
  },
  chipTextActive: {
    color: Colors.white,
    fontWeight: "600",
  },
});
