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
import { apiFetch, apiFetchWithAuth } from "@/lib/api";

const SESSION_TOKEN_KEY = "peak_session_token";

export type User = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  phoneNumber?: string | null;
  needsPhoneVerification: boolean;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  phoneOtpSent: boolean;
  getToken: () => Promise<string | null>;
  handleGoogleCredential: (credential: string) => Promise<void>;
  sendPhoneOtp: (phoneNumber: string) => Promise<void>;
  confirmPhoneOtp: (code: string) => Promise<void>;
  resetPhoneOtp: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type UserProfile = {
  hasPhone: boolean;
  phone: string | null;
  email: string | null;
  displayName: string | null;
};

async function fetchUserProfile(token: string): Promise<UserProfile> {
  return apiFetchWithAuth<UserProfile>("/api/users/me", token);
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

function setStoredToken(token: string): void {
  localStorage.setItem(SESSION_TOKEN_KEY, token);
}

function clearStoredToken(): void {
  localStorage.removeItem(SESSION_TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const phoneForOtpRef = useRef<string | null>(null);

  const loadUserFromToken = useCallback(async (token: string) => {
    try {
      const profile = await fetchUserProfile(token);
      setUser({
        uid: token,
        email: profile.email,
        displayName: profile.displayName,
        phoneNumber: profile.phone,
        needsPhoneVerification: !profile.hasPhone,
      });
    } catch {
      clearStoredToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      loadUserFromToken(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [loadUserFromToken]);

  const handleGoogleCredential = useCallback(async (credential: string) => {
    setLoading(true);
    try {
      const result = await apiFetch<{ token: string; profile: UserProfile }>(
        "/api/auth/google",
        {
          method: "POST",
          body: JSON.stringify({ credential }),
        }
      );
      setStoredToken(result.token);
      setUser({
        uid: result.token,
        email: result.profile.email,
        displayName: result.profile.displayName,
        phoneNumber: result.profile.phone,
        needsPhoneVerification: !result.profile.hasPhone,
      });
    } finally {
      setLoading(false);
    }
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

  const confirmPhoneOtp = useCallback(
    async (code: string) => {
      const phone = phoneForOtpRef.current;
      const token = getStoredToken();
      if (!phone || !token) return;
      setLoading(true);
      try {
        await apiFetchWithAuth<{ success?: boolean }>(
          "/api/users/me/phone",
          token,
          {
            method: "POST",
            body: JSON.stringify({ phone, code }),
          }
        );
        phoneForOtpRef.current = null;
        setPhoneOtpSent(false);
        await loadUserFromToken(token);
      } finally {
        setLoading(false);
      }
    },
    [loadUserFromToken]
  );

  const resetPhoneOtp = useCallback(() => {
    phoneForOtpRef.current = null;
    setPhoneOtpSent(false);
  }, []);

  const signOut = useCallback(async () => {
    clearStoredToken();
    setUser(null);
    setPhoneOtpSent(false);
    phoneForOtpRef.current = null;
  }, []);

  const getToken = useCallback(async (): Promise<string | null> => {
    return getStoredToken();
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    phoneOtpSent,
    getToken,
    handleGoogleCredential,
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
