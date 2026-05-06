/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from "react";
import { StatusBar, StyleSheet, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./src/store";
import Navigation from "./src/navigation/Navigation";
import { useAppDispatch } from "./src/store/hooks";
import UserService from "./src/services/UserService";
import AuthService from "./src/services/AuthService";
import {
  getRefreshToken,
  saveAccessToken,
  saveRefreshToken,
} from "./src/utils/Utils";
import { clearUserData, setUserData } from "./src/store/slices/userSlice";

function AppContent() {
  const isDarkMode = useColorScheme() === "dark";
  const dispatch = useAppDispatch();

  const initializeApp = async () => {
    try {
      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        dispatch(clearUserData());
        return;
      }

      // Try to refresh token and get user data in background
      const refreshResponse = await AuthService.getRefreshToken();

      if (refreshResponse?.accessToken) {
        await saveAccessToken(refreshResponse.accessToken);

        if (refreshResponse.refreshToken) {
          await saveRefreshToken(refreshResponse.refreshToken);
        }

        const userResponse = await UserService.getUserData();

        if (userResponse?.user) {
          dispatch(setUserData(userResponse.user));
        }
      }
    } catch (error: any) {
      dispatch(clearUserData());
      console.error("Error during app initialization:", error.message);
    }
  };

  React.useEffect(() => {
    initializeApp();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <Navigation />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
