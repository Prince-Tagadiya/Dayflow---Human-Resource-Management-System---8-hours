import { signInWithEmailAndPassword, signOut, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase/firebase';

// Helper to construct email from login ID if needed, or assume Login ID is email-like
// Implementation assumption: Login ID is mapped to a system email domain or is the email itself.
// e.g. loginId: "EMP-2024-001" -> email: "EMP-2024-001@dayflow.app"

const SYSTEM_EMAIL_DOMAIN = 'dayflow.app';

export const AuthService = {
  login: async (loginId: string, password: string) => {
    // Ensure loginId is treated as email if it's not already
    // Force uppercase ID to be supported if user typed it, but email auth is case insensitive? 
    // Actually, create was likely using exactly what was generated.
    // Let's assume the ID part is case-insensitive for user comfort, but we should match generation.
    // Generated ID is e.g. ODJODO20240001
    
    let email = loginId;
    if (!loginId.includes('@')) {
        // If it's a raw ID, map to system domain
        email = `${loginId}@${SYSTEM_EMAIL_DOMAIN}`;
    }
    
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

// Temporary function to bootstrap the first Admin user
// This bypasses the cloud function requirement for the INITIAL setup only
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

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
