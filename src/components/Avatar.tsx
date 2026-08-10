import React from "react";
import {
  Image,
  ImageStyle,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import Colors from "../configs/Colors";
import { getAvatarColor, getInitials } from "../utils/Formatters";

type AvatarProps = {
  name: string;
  image?: string;
  size?: number;
  style?: ImageStyle | ImageStyle[];
};

const Avatar: React.FC<AvatarProps> = ({ name, image, size = 40, style }) => {
  const dimensions = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (image) {
    return <Image source={{ uri: image }} style={[dimensions, style]} />;
  }

  return (
    <View
      style={[
        styles.fallback,
        dimensions,
        { backgroundColor: getAvatarColor(name) },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

type AvatarStackProps = {
  people: { id: string; name: string; image?: string }[];
  size?: number;
  max?: number;
};

export const AvatarStack: React.FC<AvatarStackProps> = ({
  people,
  size = 28,
  max = 4,
}) => {
  const visible = people.slice(0, max);
  const overflow = people.length - visible.length;

  return (
    <View style={styles.stack}>
      {visible.map((person, index) => (
        <Avatar
          key={person.id}
          name={person.name}
          image={person.image}
          size={size}
          style={{
            marginLeft: index === 0 ? 0 : -size * 0.32,
            borderWidth: 2,
            borderColor: Colors.white,
          }}
        />
      ))}
      {overflow > 0 ? (
        <View
          style={[
            styles.overflow,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: -size * 0.32,
            },
          ]}
        >
          <Text style={[styles.overflowText, { fontSize: size * 0.34 }]}>
            +{overflow}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: Colors.white,
    fontWeight: "700",
  },
  stack: {
    flexDirection: "row",
    alignItems: "center",
  },
  overflow: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  overflowText: {
    color: Colors.primary,
    fontWeight: "700",
  },
});
