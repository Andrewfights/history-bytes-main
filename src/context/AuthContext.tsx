/**
 * Firebase Authentication Context
 * Provides auth state and methods throughout the app
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';

// Types
export interface UserProfile {
  displayName: string;
  email: string;
  xp: number;
  streak: number;
  lastActiveDate: Date;
  selectedGuideId: string | null;
  isOnboarded: boolean;
  anonLeaderboard: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isFirebaseConfigured();

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
    if (!isConfigured) return null;

    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          displayName: data.displayName || '',
          email: data.email || '',
          xp: data.xp || 0,
          streak: data.streak || 0,
          lastActiveDate: data.lastActiveDate?.toDate() || new Date(),
          selectedGuideId: data.selectedGuideId || null,
          isOnboarded: data.isOnboarded || false,
          anonLeaderboard: data.anonLeaderboard || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }
      return null;
    } catch (err) {
      console.error('[AuthContext] Error fetching user profile:', err);
      return null;
    }
  };

  // Create user profile in Firestore
  const createUserProfile = async (uid: string, email: string, displayName: string) => {
    if (!isConfigured) return;

    try {
      const docRef = doc(db, 'users', uid);
      await setDoc(docRef, {
        displayName,
        email,
        xp: 0,
        streak: 0,
        lastActiveDate: serverTimestamp(),
        selectedGuideId: null,
        isOnboarded: false,
        anonLeaderboard: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('[AuthContext] Error creating user profile:', err);
      throw err;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [isConfigured]);

  // Sign in with email/password
  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      throw new Error('Firebase is not configured');
    }

    const { user: signedInUser } = await signInWithEmailAndPassword(auth, email, password);

    // Update last active date
    const docRef = doc(db, 'users', signedInUser.uid);
    await setDoc(docRef, {
      lastActiveDate: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  };

  // Sign up with email/password
  const signUp = async (email: string, password: string, displayName: string) => {
    if (!isConfigured) {
      throw new Error('Firebase is not configured');
    }

    // Create Firebase Auth user
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);

    // Update display name in Firebase Auth
    await updateProfile(newUser, { displayName });

    // Create user profile in Firestore
    await createUserProfile(newUser.uid, email, displayName);

    // Fetch the created profile
    const profile = await fetchUserProfile(newUser.uid);
    setUserProfile(profile);
  };

  // Sign out
  const signOut = async () => {
    if (!isConfigured) return;

    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  // Reset password
  const resetPassword = async (email: string) => {
    if (!isConfigured) {
      throw new Error('Firebase is not configured');
    }

    await sendPasswordResetEmail(auth, email);
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (!user || !isConfigured) return;

    const profile = await fetchUserProfile(user.uid);
    setUserProfile(profile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
