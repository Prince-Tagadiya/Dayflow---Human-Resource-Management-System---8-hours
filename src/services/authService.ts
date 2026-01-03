import { signInWithEmailAndPassword, signOut, type User as FirebaseUser, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

const SYSTEM_EMAIL_DOMAIN = 'dayflow.app';

export const AuthService = {
  login: async (loginId: string, password: string) => {
    let email = loginId;

    // If it looks like an ID (no @), look up the real email
    if (!loginId.includes('@')) {
      try {
        // 1. Try fetching directly by ID from employees collection (Best case: ID matches doc ID)
        const empRef = doc(db, 'employees', loginId);
        const empSnap = await getDoc(empRef);

        if (empSnap.exists() && empSnap.data().email) {
          email = empSnap.data().email;
        } else {
          // 2. Fallback: Search in use collection 'employeeId' field just in case
          const q = query(collection(db, 'users'), where('employeeId', '==', loginId));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            email = querySnapshot.docs[0].data().email;
          } else {
            // 3. Last resort: It might be a system admin logging in with pseudo-email logic if we kept that
            // But strictly speaking, if not found, it's likely an error.
            // We'll let it try the system domain fallback or just fail.
            // Let's assume the old system fallback for backward compatibility / admins.
            email = `${loginId}@${SYSTEM_EMAIL_DOMAIN}`;
          }
        }
      } catch (err) {
        console.error("Error looking up employee email:", err);
        // Fallback to trying as straight ID
        email = `${loginId}@${SYSTEM_EMAIL_DOMAIN}`;
      }
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  },

  register: async (loginId: string, password: string) => {
    const email = loginId.includes('@') ? loginId : `${loginId}@${SYSTEM_EMAIL_DOMAIN}`;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Registration failed", error);
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

// Temporary function to bootstrap the first Admin user
// This bypasses the cloud function requirement for the INITIAL setup only

export const BootstrapMakeAdmin = {
  createMasterAdmin: async () => {
    const email = "hr@dayflow.app";
    const password = "adminPassword123!";

    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create Admin Profile in Firestore (This acts as the source of truth for RoleGuard now)
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        role: 'admin', // Firestore Role (RoleGuard will check this)
        displayName: "System Administrator"
      });

      // 3. Create Employee entry for the Admin so they can exist in the system
      await setDoc(doc(db, 'employees', 'ADMIN-001'), {
        id: 'ADMIN-001',
        uid: user.uid,
        firstName: "System",
        lastName: "Admin",
        email: user.email,
        department: "HR",
        designation: "Head of HR",
        yearOfJoining: 2024,
        isActive: true,
        role: 'admin'
      });

      return { email, password };
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        // Already exists, just return credentials
        return { email, password };
      }
      throw error;
    }
  }
};
