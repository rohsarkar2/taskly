import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  Badge,
  Button,
  Container,
  Header,
  WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import { organization } from "../data";
import { PendingApprovalScreenProps } from "../navigation/NavigationTypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearUserData, setUserStatus } from "../store/slices/userSlice";
import { getUserStatusMeta } from "../utils/Formatters";

const LOCKED_FEATURES = [
  { icon: "folder-open-outline", label: "Projects" },
  { icon: "checkbox-outline", label: "Tasks" },
  { icon: "business-outline", label: "Organization data" },
];

const PendingApproval: React.FC<PendingApprovalScreenProps> = ({
  navigation,
}) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.userData);

  const handleSignOut = () => {
    dispatch(clearUserData());
    navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
  };

  // Static build only: lets you walk past the gate and see the rest of the app.
  const handleSimulateApproval = () => {
    dispatch(setUserStatus("active"));
    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs", params: { screen: "Home" } }],
    });
  };

  return (
    <Container>
      <Header title="Pending Approval" showBack={false} />
      <WhiteContainer style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconCircle}>
            <Ionicons
              name="hourglass-outline"
              size={44}
              color={Colors.warning}
            />
          </View>

          <Text style={styles.title}>Waiting for approval</Text>
          <Text style={styles.subtitle}>
            Your account is waiting for approval from your organization
            administrator. We'll notify you as soon as you're in.
          </Text>

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Organization</Text>
              <Text style={styles.cardValue}>{organization.name}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Signed in as</Text>
              <Text style={styles.cardValue}>{user?.email ?? "—"}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Status</Text>
              <Badge meta={getUserStatusMeta("pending")} size="small" />
            </View>
          </View>

          <Text style={styles.lockedTitle}>Available once approved</Text>
          <View style={styles.lockedList}>
            {LOCKED_FEATURES.map((feature) => (
              <View key={feature.label} style={styles.lockedRow}>
                <Ionicons
                  name={feature.icon}
                  size={18}
                  color={Colors.mutedFont}
                />
                <Text style={styles.lockedLabel}>{feature.label}</Text>
                <Ionicons
                  name="lock-closed"
                  size={15}
                  color={Colors.mutedFont}
                />
              </View>
            ))}
          </View>

          <Button
            title="Continue as approved (demo)"
            variant="secondary"
            onPress={handleSimulateApproval}
            style={[styles.action]}
          />
          <Button
            title="Sign Out"
            variant="secondary"
            onPress={handleSignOut}
            textStyle={styles.signOutText}
          />
        </ScrollView>
      </WhiteContainer>
    </Container>
  );
};

export default PendingApproval;

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  content: {
    paddingBottom: 40,
    alignItems: "center",
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.warningSoft,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 22,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.black,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.mutedFont,
    textAlign: "center",
    lineHeight: 21,
    marginTop: 10,
    paddingHorizontal: 8,
  },
  card: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    paddingHorizontal: 16,
    marginTop: 28,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    gap: 12,
  },
  cardLabel: {
    fontSize: 13,
    color: Colors.mutedFont,
  },
  cardValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.leaderboardBorderVeryLight,
  },
  lockedTitle: {
    alignSelf: "flex-start",
    fontSize: 13,
    fontWeight: "600",
    color: Colors.lightFont,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 28,
    marginBottom: 10,
  },
  lockedList: {
    width: "100%",
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  lockedRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    gap: 12,
  },
  lockedLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.lightFont,
  },
  action: {
    width: "100%",
    marginTop: 32,
    marginBottom: 12,
  },
  signOutText: {
    color: Colors.danger,
  },
});
