import React, { useEffect } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { Container } from "../components";
import Colors from "../configs/Colors";
import { SplashScreenProps } from "../navigation/NavigationTypes";
import { useAppSelector } from "../store/hooks";

const Splash: React.FC<SplashScreenProps> = ({ navigation }) => {
  const user = useAppSelector((state) => state.user.userData);

  useEffect(() => {
    // Stands in for the stored-token check and refresh the real app will do.
    const timer = setTimeout(() => {
      if (!user) {
        navigation.replace("Welcome");
        return;
      }

      if (user.status === "pending") {
        navigation.replace("PendingApproval");
        return;
      }

      if (user.status === "suspended") {
        navigation.replace("AccountSuspended");
        return;
      }

      navigation.replace("MainTabs", { screen: "Home" });
    }, 1400);

    return () => clearTimeout(timer);
  }, [navigation, user]);

  return (
    <Container style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("../assets/images/taskly-icon.png")}
          style={styles.logo}
        />
        <Text style={styles.name}>Taskly</Text>
        <Text style={styles.tagline}>Work, tracked together</Text>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator color={Colors.primary} />
        <Text style={styles.footerText}>Getting things ready…</Text>
      </View>
    </Container>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  name: {
    fontSize: 30,
    fontWeight: "700",
    color: Colors.black,
    marginTop: 16,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: Colors.mutedFont,
    marginTop: 6,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 56,
    gap: 10,
  },
  footerText: {
    fontSize: 13,
    color: Colors.mutedFont,
  },
});
