import React from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Button, Container, Header, WhiteContainer } from "../components";
import Colors from "../configs/Colors";
import { organization } from "../data";
import { AccountSuspendedScreenProps } from "../navigation/NavigationTypes";
import { useAppDispatch } from "../store/hooks";
import { clearUserData } from "../store/slices/userSlice";

const AccountSuspended: React.FC<AccountSuspendedScreenProps> = ({
  navigation,
}) => {
  const dispatch = useAppDispatch();

  const handleSignOut = () => {
    dispatch(clearUserData());
    navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
  };

  const handleContactAdmin = () => {
    Linking.openURL(`mailto:${organization.adminEmail}`).catch(() => {});
  };

  return (
    <Container>
      <Header title="Account Suspended" showBack={false} />
      <WhiteContainer style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name="ban-outline" size={44} color={Colors.danger} />
          </View>

          <Text style={styles.title}>Your account is suspended</Text>
          <Text style={styles.subtitle}>
            Access to {organization.name} has been paused by an administrator.
            Reach out to them to have it restored.
          </Text>

          <View style={styles.adminCard}>
            <Text style={styles.adminLabel}>Organization Admin</Text>
            <Text style={styles.adminName}>{organization.adminName}</Text>
            <Text style={styles.adminEmail}>{organization.adminEmail}</Text>
          </View>

          <Button
            title="Contact Administrator"
            onPress={handleContactAdmin}
            style={[styles.action]}
          />
          <Button
            title="Sign Out"
            variant="secondary"
            onPress={handleSignOut}
            style={[styles.action]}
            textStyle={styles.signOutText}
          />
        </View>
      </WhiteContainer>
    </Container>
  );
};

export default AccountSuspended;

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 60,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.dangerSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.black,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.mutedFont,
    textAlign: "center",
    lineHeight: 21,
    marginTop: 10,
  },
  adminCard: {
    width: "100%",
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 16,
    padding: 16,
    marginTop: 28,
    alignItems: "center",
  },
  adminLabel: {
    fontSize: 12,
    color: Colors.mutedFont,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  adminName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginTop: 8,
  },
  adminEmail: {
    fontSize: 13,
    color: Colors.lightFont,
    marginTop: 3,
  },
  action: {
    width: "100%",
    marginTop: 16,
  },
  signOutText: {
    color: Colors.danger,
  },
});
