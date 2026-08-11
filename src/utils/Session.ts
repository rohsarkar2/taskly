import UserService from "../services/UserService";
import { clearAllTokens } from "./Utils";

/**
 * Ends the session server-side, then drops the stored tokens.
 *
 * Both steps are best-effort: an already-expired token or a dead network must
 * not trap someone on a screen they are trying to sign out of, so failures are
 * swallowed and the local cleanup runs regardless. Callers still need to clear
 * the Redux state themselves.
 */
export const endSession = async () => {
  try {
    await UserService.logoutUser();
  } catch {
    // Session is gone server-side or we're offline — nothing to recover.
  }

  try {
    await clearAllTokens();
  } catch {
    // Keychain failure shouldn't block the sign out either.
  }
};
