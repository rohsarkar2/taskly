import { StyleSheet, Text, View, ViewStyle } from "react-native";
import React from "react";
import Colors from "../configs/Colors";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/NavigationTypes";
import Button from "./Button";

type Props = {
  style?: ViewStyle;
  onPress?: () => void;
};

const SignInRequired: React.FC<Props> = ({ style, onPress }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const gotoSignIn = () => {
    navigation.navigate("SignIn");
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{"Sign in to continue"}</Text>
      <Text style={styles.subText}>
        {
          "This feature of this app is available to registered users. Please sign in with your Taskly account to continue or sign up."
        }
      </Text>

      <Button title={"Sign In"} onPress={onPress ? onPress : gotoSignIn} />
    </View>
  );
};

export default SignInRequired;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  title: {
    fontFamily: "Roboto-Medium",
    fontWeight: "500",
    fontSize: 20,
    color: Colors.secondaryFont,
    marginBottom: 10,
    textAlign: "center",
  },
  subText: {
    fontFamily: "Roboto-Regular",
    fontSize: 13,
    fontWeight: "400",
    color: Colors.secondaryFont,
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 18,
  },
  btn: {
    marginTop: 30,
    height: 40,
    width: "95%",
  },
});
