import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import organizationReducer from "./slices/organizationSlice";
import userReducer from "./slices/userSlice";

// Combine reducers
const rootReducer = combineReducers({
  user: userReducer,
  organization: organizationReducer,
});

// Persist configuration
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["user", "organization"], // session state survives a restart
  /**
   * redux-persist otherwise swallows the cause behind a bare
   * "Error storing data". The useful detail is on the native error underneath:
   * `type` says whether it was Sqlite, the legacy file store or the module
   * itself, and iOS carries the real NSError in `userInfo`.
   *
   * A failed write is not fatal — the tokens live in the Keychain and Splash
   * re-reads them — but it means this snapshot didn't reach disk.
   */
  writeFailHandler: (error: any) => {
    console.warn(
      "[persist] failed to write session state",
      error?.type ?? "unknown",
      error?.errorMessage ?? error?.message,
      error?.userInfo ?? error?.cause ?? "",
    );
  },
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PAUSE",
          "persist/PURGE",
          "persist/REGISTER",
          "persist/FLUSH",
        ],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
