"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  type User as FirebaseUser,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { apiFetch, apiFetchWithAuth } from "@/lib/api";

export type User = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  phoneNumber?: string | null;
  /** True when user signed in with Google but has not yet verified phone (first-time account). */
  needsPhoneVerification: boolean;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  phoneOtpSent: boolean;
  getToken: () => Promise<string | null>;
  signInWithGoogle: () => Promise<void>;
  sendPhoneOtp: (phoneNumber: string) => Promise<void>;
  confirmPhoneOtp: (code: string) => Promise<void>;
  resetPhoneOtp: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchUserProfile(token: string): Promise<{
  hasPhone: boolean;
  phone: string | null;
  email: string | null;
  displayName: string | null;
}> {
  return apiFetchWithAuth<{
    hasPhone: boolean;
    phone: string | null;
    email: string | null;
    displayName: string | null;
  }>("/api/users/me", token);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const phoneForOtpRef = useRef<string | null>(null);

  const syncUser = useCallback(async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      setUser(null);
      setLoading(false);
      return;
    }
    if (!isFirebaseConfigured()) {
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? null,
        displayName: firebaseUser.displayName ?? null,
        phoneNumber: null,
        needsPhoneVerification: false,
      });
      setLoading(false);
      return;
    }
    try {
      const token = await firebaseUser.getIdToken();
      const profile = await fetchUserProfile(token);
      setUser({
        uid: firebaseUser.uid,
        email: profile.email ?? firebaseUser.email ?? null,
        displayName: profile.displayName ?? firebaseUser.displayName ?? null,
        phoneNumber: profile.phone,
        needsPhoneVerification: !profile.hasPhone,
      });
    } catch (err) {
      console.error("[Auth] Failed to fetch user profile:", err);
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? null,
        displayName: firebaseUser.displayName ?? null,
        phoneNumber: null,
        needsPhoneVerification: true,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }
    let mounted = true;
    getRedirectResult(auth)
      .then(() => {
        if (!mounted) return;
        // User may have just returned from Google redirect; onAuthStateChanged will run
      })
      .catch((err) => {
        if (mounted) console.error("[Auth] Redirect result error:", err);
      });
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (mounted) {
        setLoading(true);
        syncUser(firebaseUser);
      }
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [syncUser]);

  const signInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase is not configured");
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
    // User is navigated away to Google; will return to this site and getRedirectResult will run
  }, []);

  const sendPhoneOtp = useCallback(async (phoneNumber: string) => {
    setLoading(true);
    setPhoneOtpSent(false);
    phoneForOtpRef.current = null;
    try {
      await apiFetch<{ message?: string }>("/api/otp/send", {
        method: "POST",
        body: JSON.stringify({ phone: phoneNumber }),
      });
      phoneForOtpRef.current = phoneNumber;
      setPhoneOtpSent(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmPhoneOtp = useCallback(async (code: string) => {
    const phone = phoneForOtpRef.current;
    const auth = getFirebaseAuth();
    if (!phone || !auth?.currentUser) return;
    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      await apiFetchWithAuth<{ success?: boolean }>("/api/users/me/phone", token, {
        method: "POST",
        body: JSON.stringify({ phone, code }),
      });
      phoneForOtpRef.current = null;
      setPhoneOtpSent(false);
      await syncUser(auth.currentUser);
    } finally {
      setLoading(false);
    }
  }, [syncUser]);

  const resetPhoneOtp = useCallback(() => {
    phoneForOtpRef.current = null;
    setPhoneOtpSent(false);
  }, []);

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth) await firebaseSignOut(auth);
    setUser(null);
    setPhoneOtpSent(false);
    phoneForOtpRef.current = null;
  }, []);

  const getToken = useCallback(async (): Promise<string | null> => {
    const auth = getFirebaseAuth();
    const firebaseUser = auth?.currentUser;
    if (!firebaseUser) return null;
    return firebaseUser.getIdToken();
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    phoneOtpSent,
    getToken,
    signInWithGoogle,
    sendPhoneOtp,
    confirmPhoneOtp,
    resetPhoneOtp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
