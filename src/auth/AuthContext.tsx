import React, { createContext, useContext, useEffect, useState } from 'react';
import { onIdTokenChanged, type IdTokenResult, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import type { UserRole } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  role: UserRole | null;
  loading: boolean;
  claims: Record<string, any>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  claims: {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [claims, setClaims] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for token changes to capture Custom Claims (role)
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult: IdTokenResult = await firebaseUser.getIdTokenResult();
        
        let userRole = (tokenResult.claims.role as UserRole) || null;
        


        setUser(firebaseUser);
        setClaims(tokenResult.claims);
        setRole(userRole);
        
        // --- REAL TIME ROLE LISTENER (Robustness) ---
        // If the claim isn't there, let's look at the Firestore Document
        if (!userRole) {
             try {
                // Using standard imports from firebase/firestore which should be available
                // We need to import db from the module scope to be safe or use getFirestore()
                const { doc, getDoc } = await import('firebase/firestore');
                const { db } = await import('../firebase/firebase');
                
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    console.log("AuthContext: Found User Role in Firestore:", userData.role);
                    if (userData.role) {
                        setRole(userData.role as UserRole);
                    }
                } else {
                    console.warn("AuthContext: User document not found in Firestore for UID:", firebaseUser.uid);
                }
             } catch (err) {
                 console.error("AuthContext/Firestore Error: Failed to fetch user role.", err);
             }
        }

      } else {
        setUser(null);
        setClaims({});
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, claims }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
