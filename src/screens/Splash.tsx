import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { Container } from "../components";
import Colors from "../configs/Colors";
import { SplashScreenProps } from "../navigation/NavigationTypes";
import UserService from "../services/UserService";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  clearOrganizationData,
  setOrganizationData,
} from "../store/slices/organizationSlice";
import { clearUserData, setUserData } from "../store/slices/userSlice";
import { mapApiOrganization, mapApiUser } from "../utils/Mappers";
import { endSession } from "../utils/Session";
import { getAccessToken, getRefreshToken } from "../utils/Utils";

const Splash: React.FC<SplashScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  // PersistGate holds the tree back until rehydration finishes, so the value
  // read on the first render is the persisted session.
  const persistedUser = useAppSelector((state) => state.user.userData);
  const hasBootstrapped = useRef(false);

  useEffect(() => {
    // `initialize` writes a fresh user back into the store, which re-renders
    // this screen — the ref keeps the bootstrap to a single run.
    if (hasBootstrapped.current) {
      return;
    }
    hasBootstrapped.current = true;

    const bootstrap = async () => {
      const token = await getAccessToken().catch(() => null);

      if (!token || !persistedUser) {
        navigation.replace("Welcome");
        return;
      }

      try {
        const response = await UserService.getUserData();

        const data = response?.data;
        const user = mapApiUser(data?.user);

        // initialize doesn't reissue tokens, but the axios interceptor may have
        // rotated the pair while the call was in flight — so re-read the
        // keychain rather than trusting the persisted copy.
        const [accessToken, refreshToken] = await Promise.all([
          getAccessToken().catch(() => null),
          getRefreshToken().catch(() => null),
        ]);

        dispatch(
          setUserData({
            ...user,
            accessToken: accessToken ?? persistedUser.accessToken,
            refreshToken: refreshToken ?? persistedUser.refreshToken,
          }),
        );

        if (data?.organization) {
          dispatch(setOrganizationData(mapApiOrganization(data.organization)));
        }

        if (data?.approvalPending || user.status === "pending") {
          navigation.replace("PendingApproval");
          return;
        }

        if (user.status === "suspended") {
          navigation.replace("AccountSuspended");
          return;
        }

        navigation.replace("MainTabs", { screen: "Home" });
      } catch {
        // Token refresh already had its chance in the axios interceptor, so a
        // failure here means the session is unusable. Start over cleanly.
        await endSession();
        dispatch(clearUserData());
        dispatch(clearOrganizationData());
        navigation.replace("Welcome");
      }
    };

    bootstrap();
  }, [dispatch, navigation, persistedUser]);

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
