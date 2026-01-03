import { signInWithEmailAndPassword, signOut, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase/firebase';

// Helper to construct email from login ID if needed, or assume Login ID is email-like
// Implementation assumption: Login ID is mapped to a system email domain or is the email itself.
// e.g. loginId: "EMP-2024-001" -> email: "EMP-2024-001@dayflow.app"

const SYSTEM_EMAIL_DOMAIN = 'dayflow.app';

export const AuthService = {
  login: async (loginId: string, password: string) => {
    // Ensure loginId is treated as email if it's not already
    const email = loginId.includes('@') ? loginId : `${loginId}@${SYSTEM_EMAIL_DOMAIN}`;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
      throw error;
    }
  },

  getCurrentUser: (): FirebaseUser | null => {
    return auth.currentUser;
  },
  
  // Force token refresh to get latest custom claims
  refreshToken: async () => {
    if (auth.currentUser) {
      await auth.currentUser.getIdToken(true);
    }
  }
};
