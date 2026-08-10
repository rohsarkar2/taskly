import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Button, Container, WhiteContainer } from "../components";
import Colors from "../configs/Colors";
import { WelcomeScreenProps } from "../navigation/NavigationTypes";

const FEATURES = [
  {
    icon: "folder-open-outline",
    title: "Projects in one place",
    description: "See every project you belong to and how far along it is.",
  },
  {
    icon: "checkbox-outline",
    title: "A clear task workflow",
    description: "To do, in progress, pending approval, done — nothing lost.",
  },
  {
    icon: "shield-checkmark-outline",
    title: "Approvals that make sense",
    description: "Submit work for review and get feedback without chasing.",
  },
];

const Welcome: React.FC<WelcomeScreenProps> = ({ navigation }) => (
  <Container>
    <WhiteContainer style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Image
            source={require("../assets/images/taskly-icon.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>Welcome to Taskly</Text>
          <Text style={styles.subtitle}>
            Your team's projects, tasks and approvals — on your phone.
          </Text>
        </View>

        <View style={styles.features}>
          {FEATURES.map((feature) => (
            <View key={feature.title} style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons
                  name={feature.icon}
                  size={22}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Button title="Sign In" onPress={() => navigation.navigate("SignIn")} />
        <Button
          title="Create an account"
          variant="secondary"
          onPress={() => navigation.navigate("SignUp")}
        />
        <Text style={styles.legal}>
          By continuing you agree to Taskly's Terms of Service and Privacy
          Policy.
        </Text>
      </View>
    </WhiteContainer>
  </Container>
);

export default Welcome;

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    paddingHorizontal: 20,
  },
  content: {
    paddingTop: 40,
    paddingBottom: 24,
  },
  hero: {
    alignItems: "center",
  },
  logo: {
    width: 96,
    height: 96,
    resizeMode: "contain",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.black,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.mutedFont,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  features: {
    marginTop: 40,
    gap: 22,
  },
  feature: {
    flexDirection: "row",
    gap: 14,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
  },
  featureDescription: {
    fontSize: 13,
    color: Colors.mutedFont,
    lineHeight: 19,
    marginTop: 3,
  },
  actions: {
    paddingBottom: 28,
    gap: 12,
  },
  legal: {
    fontSize: 11,
    color: Colors.mutedFont,
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 16,
    marginTop: 4,
  },
});
