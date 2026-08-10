import React from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../configs/Colors";

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  style?: ViewStyle;
};

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = "Search",
  onFilterPress,
  style,
}) => (
  <View style={[styles.row, style]}>
    <View style={styles.field}>
      <Ionicons name="search-outline" size={18} color={Colors.mutedFont} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.mutedFont}
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <TouchableOpacity onPress={() => onChangeText("")} activeOpacity={0.7}>
          <Ionicons name="close-circle" size={18} color={Colors.mutedFont} />
        </TouchableOpacity>
      ) : null}
    </View>

    {onFilterPress ? (
      <TouchableOpacity
        style={styles.filterButton}
        onPress={onFilterPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Filters"
      >
        <Ionicons name="options-outline" size={20} color={Colors.primary} />
      </TouchableOpacity>
    ) : null}
  </View>
);

export default SearchBar;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  field: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.black,
    padding: 0,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.borderGray,
    backgroundColor: Colors.white,
  },
});
