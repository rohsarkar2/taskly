import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../configs/Colors";
import Constant from "../configs/Constant";

export type SheetOption = {
  key: string;
  label: string;
  description?: string;
  icon?: string;
  color?: string;
};

type OptionSheetProps = {
  visible: boolean;
  title: string;
  options: SheetOption[];
  selectedKey?: string | null;
  onSelect: (option: SheetOption) => void;
  onClose: () => void;
};

const OptionSheet: React.FC<OptionSheetProps> = ({
  visible,
  title,
  options,
  selectedKey,
  onSelect,
  onClose,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <Pressable style={styles.backdrop} onPress={onClose} />

    <View style={styles.sheet}>
      <View style={styles.grabber} />

      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={22} color={Colors.lightFont} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {options.map((option) => {
          const isSelected = option.key === selectedKey;

          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => onSelect(option)}
              activeOpacity={0.7}
            >
              {option.icon ? (
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={option.color ?? Colors.lightFont}
                />
              ) : null}

              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                {option.description ? (
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                ) : null}
              </View>

              {isSelected ? (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={Colors.primary}
                />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  </Modal>
);

export default OptionSheet;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: Constant.WINDOW_HEIGHT * 0.7,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderGray,
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.black,
  },
  list: {
    flexGrow: 0,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
    marginBottom: 4,
  },
  optionSelected: {
    backgroundColor: Colors.secondary,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.black,
  },
  optionDescription: {
    fontSize: 12,
    color: Colors.mutedFont,
    marginTop: 2,
  },
});
