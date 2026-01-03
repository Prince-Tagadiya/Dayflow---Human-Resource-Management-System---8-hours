import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onIdTokenChanged, IdTokenResult } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { UserRole } from '../types';

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
        setUser(firebaseUser);
        setClaims(tokenResult.claims);
        setRole((tokenResult.claims.role as UserRole) || null);
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
