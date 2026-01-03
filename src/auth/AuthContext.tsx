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
  console.log("AuthProvider: Rendering...");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [claims, setClaims] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    console.log("AuthProvider: mounted, starting auth listener");
    // Listen for token changes to capture Custom Claims (role)
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      try {
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
      } catch (error) {
        console.error("Error in auth state change:", error);
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error("Auth subscription error:", error);
      setLoading(false);
    });

    // Safety timeout in case Firebase hangs
    const timeoutId = setTimeout(() => {
      setLoading((currentLoading) => {
        if (currentLoading) {
          console.warn("Auth initialization timed out");
          return false;
        }
        return currentLoading;
      });
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, claims }}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading Dayflow...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
