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
  sendEmailVerification,
  updateProfile,
  applyActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode,
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

interface SignInResult {
  uid: string;
  email: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  emailVerified: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (email: string, password: string, displayName: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  confirmPasswordResetCode: (code: string, newPassword: string) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  reloadUser: () => Promise<void>;
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
  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    if (!isConfigured) {
      throw new Error('Firebase is not configured');
    }

    try {
      console.log('[AuthContext] Attempting sign in for:', email);
      const { user: signedInUser } = await signInWithEmailAndPassword(auth, email, password);
      console.log('[AuthContext] ✅ Sign in successful for:', email);
      console.log('[AuthContext] User UID:', signedInUser.uid);
      console.log('[AuthContext] Email verified:', signedInUser.emailVerified);

      // Update last active date
      try {
        const docRef = doc(db, 'users', signedInUser.uid);
        await setDoc(docRef, {
          lastActiveDate: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
        console.log('[AuthContext] ✅ Updated last active date');
      } catch (firestoreErr) {
        console.warn('[AuthContext] Failed to update last active date:', firestoreErr);
        // Don't throw - sign in was successful
      }

      return {
        uid: signedInUser.uid,
        email: signedInUser.email || email,
        emailVerified: signedInUser.emailVerified,
      };
    } catch (err: any) {
      console.error('[AuthContext] ❌ Sign in failed:', err);
      console.error('[AuthContext] Error code:', err?.code);
      console.error('[AuthContext] Error message:', err?.message);
      throw err; // Re-throw so UI can handle it
    }
  };

  // Sign up with email/password
  const signUp = async (email: string, password: string, displayName: string): Promise<SignInResult> => {
    if (!isConfigured) {
      throw new Error('Firebase is not configured');
    }

    // Create Firebase Auth user
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);

    // Update display name in Firebase Auth
    await updateProfile(newUser, { displayName });

    // Create user profile in Firestore
    await createUserProfile(newUser.uid, email, displayName);

    // Send verification email
    try {
      console.log('[AuthContext] Attempting to send verification email to:', email);
      console.log('[AuthContext] Action URL:', window.location.origin);

      await sendEmailVerification(newUser, {
        url: window.location.origin,
      });

      console.log('[AuthContext] ✅ Verification email sent successfully to:', email);
    } catch (err: any) {
      console.error('[AuthContext] ❌ Failed to send verification email:', err);
      console.error('[AuthContext] Error code:', err?.code);
      console.error('[AuthContext] Error message:', err?.message);
      // Don't throw - account was created successfully
    }

    // Fetch the created profile
    const profile = await fetchUserProfile(newUser.uid);
    setUserProfile(profile);

    return {
      uid: newUser.uid,
      email: newUser.email || email,
      emailVerified: newUser.emailVerified,
    };
  };

  // Sign out
  const signOut = async () => {
    if (!isConfigured) return;

    try {
      console.log('[AuthContext] Signing out user:', user?.email);
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      console.log('[AuthContext] ✅ Sign out successful');
    } catch (err: any) {
      console.error('[AuthContext] ❌ Sign out failed:', err);
      throw err;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    if (!isConfigured) {
      throw new Error('Firebase is not configured');
    }

    try {
      console.log('[AuthContext] Attempting to send password reset email to:', email);
      await sendPasswordResetEmail(auth, email);
      console.log('[AuthContext] ✅ Password reset email sent successfully to:', email);
    } catch (err: any) {
      console.error('[AuthContext] ❌ Failed to send password reset email:', err);
      console.error('[AuthContext] Error code:', err?.code);
      console.error('[AuthContext] Error message:', err?.message);
      throw err; // Re-throw so UI can handle it
    }
  };

  // Send verification email
  const sendVerificationEmailFn = async () => {
    if (!isConfigured || !user) {
      throw new Error('No user logged in');
    }

    try {
      console.log('[AuthContext] Attempting to resend verification email to:', user.email);
      await sendEmailVerification(user, {
        url: window.location.origin, // Redirect back to the app after verification
      });
      console.log('[AuthContext] ✅ Verification email resent successfully');
    } catch (err: any) {
      console.error('[AuthContext] ❌ Failed to resend verification email:', err);
      console.error('[AuthContext] Error code:', err?.code);
      console.error('[AuthContext] Error message:', err?.message);
      throw err; // Re-throw so UI can handle it
    }
  };

  // Confirm password reset with new password
  const confirmPasswordResetCode = async (code: string, newPassword: string) => {
    if (!isConfigured) {
      throw new Error('Firebase is not configured');
    }

    // Verify the code first
    await verifyPasswordResetCode(auth, code);
    // Then reset the password
    await confirmPasswordReset(auth, code, newPassword);
  };

  // Verify email with action code
  const verifyEmail = async (code: string) => {
    if (!isConfigured) {
      throw new Error('Firebase is not configured');
    }

    await applyActionCode(auth, code);
    // Reload user to get updated emailVerified status
    if (user) {
      await user.reload();
      setUser({ ...user }); // Trigger re-render
    }
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (!user || !isConfigured) return;

    const profile = await fetchUserProfile(user.uid);
    setUserProfile(profile);
  };

  // Reload user to refresh auth state (e.g., after email verification)
  const reloadUser = async () => {
    if (!user || !isConfigured) return;

    await user.reload();
    // Get fresh user object
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isConfigured,
        emailVerified: user?.emailVerified ?? false,
        signIn,
        signUp,
        signOut,
        resetPassword,
        sendVerificationEmail: sendVerificationEmailFn,
        confirmPasswordResetCode,
        verifyEmail,
        refreshUserProfile,
        reloadUser,
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
