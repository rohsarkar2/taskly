import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { SettingsScreenProps } from "../navigation/NavigationTypes";
import { Button, Container, Header, WhiteContainer } from "../components";
import UserService from "../services/UserService";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearUserData } from "../store/slices/userSlice";
import { clearAllTokens } from "../utils/Utils";

const Settings: React.FC<SettingsScreenProps> = (
  props: SettingsScreenProps,
) => {
  const user = useAppSelector((state) => state.user.userData);
  const dispatch = useAppDispatch();

  const handleSignOut = async () => {
    try {
      await UserService.logoutUser({ email: user?.email });
      dispatch(clearUserData());
      clearAllTokens();
      props.navigation.navigate("Home");
    } catch (error: any) {
      console.error("Error during sign out:", error.message);
    }
  };

  return (
    <Container>
      <Header title="Settings" />
      <WhiteContainer>
        <Button title="Sign Out" onPress={handleSignOut} />
      </WhiteContainer>
    </Container>
  );
};

export default Settings;

const styles = StyleSheet.create({});
