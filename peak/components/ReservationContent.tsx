"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Translations } from "@/lib/translations";
import {
  getReservationsForDate,
  getReservedStationsForSlot,
  getDayCalendarGrid,
  DAY_HOURS,
  saveReservation,
  deleteReservation,
  MAX_NAME_LENGTH,
  MIN_ADVANCE_HOURS,
  type Reservation,
} from "@/lib/reservations";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

const PS5_IMAGE = "/playstation.jpg";
const PC_IMAGE = "/pc.jpg";

const HOURS = Array.from({ length: 13 }, (_, i) => 12 + i);

type Props = { t: Translations; basePath?: string };

function DayCalendarTable({
  title,
  stationCount,
  grid,
  t,
  currentUserId,
  onDelete,
  deletingId,
}: {
  title: string;
  stationCount: number;
  grid: Record<number, Record<number, Reservation | null>>;
  t: Translations;
  currentUserId?: string | null;
  onDelete?: (reservation: Reservation) => void;
  deletingId?: string | null;
}) {
  const stations = Array.from({ length: stationCount }, (_, i) => i + 1);
  return (
    <div className="overflow-x-auto">
      <h4 className="text-sm font-semibold text-accent mb-2">{title}</h4>
      <table className="w-full min-w-[320px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-accent/30">
            <th className="text-left py-2 pr-3 font-medium text-foreground/80 w-14">
              {t.reservation.time}
            </th>
            {stations.map((s) => (
              <th
                key={s}
                className="py-2 px-1 text-center font-medium text-foreground/80 w-20"
              >
                #{s}
                {stationCount === 5 && s === 5 && (
                  <div className="text-[9px] text-accent/70 font-normal text-center leading-tight wrap-break-word whitespace-normal">
                    {t.games.steeringWheelTitle}
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAY_HOURS.map((h) => (
            <tr
              key={h}
              className="border-b border-foreground/10 hover:bg-foreground/5"
            >
              <td className="py-1.5 pr-3 text-foreground/70 tabular-nums">
                {String(h).padStart(2, "0")}:00
              </td>
              {stations.map((s) => {
                const r = grid[h][s];
                const resUserId =
                  r?.userId ?? (r as { user_id?: string })?.user_id;
                const isOwn = !!(
                  r &&
                  currentUserId &&
                  resUserId === currentUserId
                );
                const isDeleting = !!(r && deletingId === r.id);
                return (
                  <td key={s} className="py-1.5 px-1 text-center">
                    {r ? (
                      <div className="inline-flex max-w-full items-center gap-1 rounded overflow-hidden">
                        <span
                          className="inline-block max-w-full truncate rounded-l bg-accent/20 px-2 py-1 text-foreground text-xs"
                          title={r.name}
                        >
                          {r.name}
                        </span>
                        {isOwn && onDelete && (
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => onDelete(r)}
                            className="rounded-r bg-red-600 px-2 py-1 text-white text-xs font-medium hover:bg-red-500 disabled:opacity-60 shrink-0 min-w-[24px]"
                            title="Delete your reservation"
                          >
                            {isDeleting ? "…" : "✕"}
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-foreground/30">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Normalize to E.164.
 * For Romanian numbers:
 *  - "0753532559" -> "+40753532559"
 *  - "753532559"  -> "+40753532559"
 * Other numbers keep all digits and just get a leading "+" if missing.
 */
function toE164(phone: string, defaultCountryCode = "+40"): string {
  const raw = phone.trim();
  if (raw.startsWith("+")) return raw;
  const digits = raw.replace(/\D/g, "");
  // Romanian local with leading 0 (10 digits starting with 0)
  if (digits.length === 10 && digits.startsWith("0")) {
    return `${defaultCountryCode}${digits.slice(1)}`;
  }
  // Romanian local without leading 0 (9 digits)
  if (digits.length === 9) {
    return `${defaultCountryCode}${digits}`;
  }
  // Fallback: just prefix "+" to whatever digits we have
  return `+${digits}`;
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current ${className}`}
    />
  );
}

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.1 24.1 0 0 0 0 21.56l7.98-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function GoogleCustomButton({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-6 py-3 font-medium text-gray-700 shadow-md ring-1 ring-black/10 transition-all hover:shadow-lg hover:ring-black/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
    >
      {loading ? <Spinner className="text-gray-500" /> : <GoogleLogo />}
      <span className="text-[15px]">Continue with Google</span>
    </button>
  );
}

export function ReservationContent({ t, basePath = "" }: Props) {
  const {
    user,
    loading: authLoading,
    phoneOtpSent,
    sendPhoneOtp,
    confirmPhoneOtp,
    resetPhoneOtp,
    signInWithGoogle,
    signOut,
    getToken,
  } = useAuth();
  const [type, setType] = useState<"ps5" | "pc" | null>(null);
  const [selectedStations, setSelectedStations] = useState<number[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("1");
  const [name, setName] = useState("");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [signInPhone, setSignInPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [phoneAuthError, setPhoneAuthError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isConfirmingOtp, setIsConfirmingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [showTypeHint, setShowTypeHint] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showChooseTypeNotification, setShowChooseTypeNotification] =
    useState(false);

  const typeSectionRef = useRef<HTMLDivElement | null>(null);
  const timeSectionRef = useRef<HTMLDivElement | null>(null);
  const stationSectionRef = useRef<HTMLDivElement | null>(null);
  const nameSectionRef = useRef<HTMLDivElement | null>(null);
  const reservedSlotsRef = useRef<HTMLDivElement | null>(null);

  const scrollToRef = (ref: React.RefObject<HTMLElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const tError = useCallback(
    (err: unknown): string => {
      if (err instanceof ApiError) {
        switch (err.code) {
          case "AUTH_NOT_CONFIGURED":
            return t.reservation.errors.authNotConfigured;
          case "AUTH_REQUIRED":
            return t.reservation.errors.authRequired;
          case "AUTH_INVALID_TOKEN":
            return t.reservation.errors.authInvalid;
          case "AUTH_INVALID_CREDENTIAL":
            return t.reservation.errors.authInvalidCredential;
          case "PHONE_REQUIRED":
          case "USER_PHONE_REQUIRED":
            return t.reservation.errors.phoneRequired;
          case "PHONE_INVALID_FORMAT":
            return t.reservation.errors.phoneInvalid;
          case "SMS_NOT_CONFIGURED":
            return t.reservation.errors.smsNotConfigured;
          case "SMS_SEND_FAILED":
            return t.reservation.errors.smsSendFailed;
          case "OTP_CODE_REQUIRED":
            return t.reservation.errors.otpCodeRequired;
          case "OTP_INVALID":
            return t.reservation.errors.otpInvalid;
          case "USER_EMAIL_REQUIRED":
            return t.reservation.errors.emailRequired;
          case "RESERVATION_SAVE_FAILED":
            return t.reservation.errors.reservationSaveFailed;
          case "RESERVATION_DELETE_FAILED":
            return t.reservation.errors.reservationDeleteFailed;
          case "RESERVATION_FETCH_FAILED":
            return t.reservation.errors.reservationFetchFailed;
          default:
            return t.reservation.errors.unknown;
        }
      }
      return t.reservation.errors.unknown;
    },
    [t],
  );

  useEffect(() => {
    if (!user) return;
    if (user.displayName && !name) setName(user.displayName);
  }, [user]);

  // Clear OTP/phone error when form is shown so it doesn’t appear under the reservation form
  useEffect(() => {
    if (user) setPhoneAuthError("");
  }, [user]);

  const handleSendOtp = useCallback(async () => {
    setPhoneAuthError("");
    const raw = signInPhone.trim();
    if (!raw) {
      setPhoneAuthError(t.reservation.errors.phoneRequired);
      return;
    }
    try {
      setIsSendingOtp(true);
      await sendPhoneOtp(toE164(raw));
    } catch (err: unknown) {
      setPhoneAuthError(tError(err));
    } finally {
      setIsSendingOtp(false);
    }
  }, [signInPhone, sendPhoneOtp, tError, t.reservation.errors.phoneRequired]);

  const handleConfirmOtp = useCallback(async () => {
    setPhoneAuthError("");
    if (!otpCode.trim()) return;
    try {
      setIsConfirmingOtp(true);
      await confirmPhoneOtp(otpCode.trim());
      setOtpCode("");
      setPhoneVerified(true);
    } catch (err: unknown) {
      setPhoneAuthError(tError(err));
    } finally {
      setIsConfirmingOtp(false);
    }
  }, [otpCode, confirmPhoneOtp, tError]);

  const maxStation = type === "ps5" ? 5 : type === "pc" ? 9 : 0;
  const stations =
    maxStation > 0 ? Array.from({ length: maxStation }, (_, i) => i + 1) : [];

  const todayIso = new Date().toISOString().slice(0, 10);
  const displayDate = date || todayIso;
  const reservedForDate = reservations;
  const reservedStationNums =
    type && time && duration
      ? getReservedStationsForSlot(reservations, type, time, Number(duration))
      : [];

  useEffect(() => {
    let cancelled = false;
    setIsLoadingReservations(true);
    getReservationsForDate(displayDate)
      .then((list) => {
        if (!cancelled) setReservations(list);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingReservations(false);
      });
    return () => {
      cancelled = true;
    };
  }, [displayDate]);

  const handleDeleteReservation = useCallback(
    async (reservation: Reservation) => {
      setDeleteError("");
      try {
        const token = await getToken();
        if (!token) {
          setDeleteError(t.reservation.errors.authRequired);
          return;
        }
        setDeletingId(reservation.id);
        await deleteReservation(reservation.id, token);
        const next = await getReservationsForDate(reservation.date);
        setReservations(next);
      } catch (err) {
        setDeleteError(tError(err));
      } finally {
        setDeletingId(null);
      }
    },
    [getToken, tError, t.reservation.errors.authRequired],
  );

  // Auto-hide success notifications
  useEffect(() => {
    if (!submitted) return;
    const timer = setTimeout(() => setSubmitted(false), 4000);
    return () => clearTimeout(timer);
  }, [submitted]);

  useEffect(() => {
    if (!phoneVerified) return;
    const timer = setTimeout(() => setPhoneVerified(false), 4000);
    return () => clearTimeout(timer);
  }, [phoneVerified]);

  useEffect(() => {
    if (!showChooseTypeNotification) return;
    const timer = setTimeout(() => setShowChooseTypeNotification(false), 4500);
    return () => clearTimeout(timer);
  }, [showChooseTypeNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!user) {
      setSubmitError(t.reservation.validation.mustBeSignedIn);
      return;
    }
    if (!type) {
      setSubmitError(t.reservation.validation.chooseType);
      setShowTypeHint(true);
      setShowChooseTypeNotification(true);
      scrollToRef(typeSectionRef);
      return;
    }
    if (selectedStations.length === 0) {
      setSubmitError(t.reservation.validation.selectStation);
      scrollToRef(stationSectionRef);
      return;
    }
    if (!time) {
      setSubmitError(t.reservation.validation.chooseTime);
      scrollToRef(timeSectionRef);
      return;
    }
    // Enforce minimum advance booking time on the client as well
    const reservationDate = displayDate;
    const now = new Date();
    const reservationStart = new Date(`${reservationDate}T${time}:00`);
    if (!Number.isNaN(reservationStart.getTime())) {
      const diffMs = reservationStart.getTime() - now.getTime();
      const minMs = MIN_ADVANCE_HOURS * 60 * 60 * 1000;
      if (diffMs < minMs) {
        const unit = MIN_ADVANCE_HOURS === 1 ? "hour" : "hours";
        setSubmitError(
          t.reservation.validation.advanceBooking
            .replace("{hours}", String(MIN_ADVANCE_HOURS))
            .replace("{unit}", unit),
        );
        scrollToRef(timeSectionRef);
        return;
      }
    }
    if (!name.trim()) {
      setSubmitError(t.reservation.validation.nameRequired);
      scrollToRef(nameSectionRef);
      return;
    }
    const trimmedName = name.trim();
    if (trimmedName.length > MAX_NAME_LENGTH) {
      setSubmitError(
        t.reservation.validation.nameTooLong.replace(
          "{max}",
          String(MAX_NAME_LENGTH),
        ),
      );
      return;
    }
    const token = await getToken();
    if (!token) {
      setSubmitError(t.reservation.validation.mustBeSignedIn);
      return;
    }
    // reuse reservationDate computed above
    try {
      setIsSubmitting(true);
      for (const station of selectedStations) {
        await saveReservation(
          {
            type,
            station,
            date: reservationDate,
            time,
            duration: Number(duration),
            name: trimmedName,
          },
          token,
        );
      }
      const next = await getReservationsForDate(reservationDate);
      setReservations(next);
      setSubmitted(true);
      setSelectedStations([]);
      scrollToRef(reservedSlotsRef);
    } catch (err) {
      setSubmitError(tError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-grid-led bg-background">
      <section className="px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            <span className="text-accent led-text">{t.reservation.title}</span>
          </h1>
          <p className="mt-2 text-foreground/70">{t.reservation.subtitle}</p>

          {authLoading && (
            <div className="mt-6 flex items-center justify-center gap-3 rounded-xl border border-accent/40 bg-accent/5 p-6">
              <Spinner className="h-5 w-5 text-accent" />
              <span className="text-foreground/70">
                {t.reservation.loadingAccount ?? "Loading your account…"}
              </span>
            </div>
          )}

          {!authLoading && user && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <span className="text-foreground/70">
                {t.reservation.signedInAs}{" "}
                <strong className="text-foreground">
                  {user.email ??
                    user.displayName ??
                    user.phoneNumber ??
                    user.uid}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-lg border border-accent/40 bg-transparent px-4 py-2 text-accent hover:bg-accent/10 transition"
              >
                {t.reservation.signOut}
              </button>
            </div>
          )}

          {!authLoading && !user && (
            <div className="mt-6 rounded-xl border border-accent/40 bg-accent/5 p-6 text-center">
              <p className="text-foreground/90 mb-2">
                {t.reservation.signInWithGoogleFirst}
              </p>
              <p className="text-foreground/70 text-sm mb-4">
                {t.reservation.thenVerifyPhone}
              </p>
              <div className="inline-flex items-center justify-center">
                <GoogleCustomButton
                  loading={isSigningIn}
                  onClick={() => {
                    setPhoneAuthError("");
                    setIsSigningIn(true);
                    signInWithGoogle()
                      .catch((e) =>
                        setPhoneAuthError(
                          e instanceof Error ? e.message : "Sign-in failed",
                        ),
                      )
                      .finally(() => setIsSigningIn(false));
                  }}
                />
              </div>
              {phoneAuthError && (
                <p className="text-sm text-red-500 mt-3" role="alert">
                  {phoneAuthError}
                </p>
              )}
            </div>
          )}

          {!authLoading && user?.needsPhoneVerification && (
            <div className="mt-6 rounded-xl border border-accent/40 bg-accent/5 p-6 text-center">
              <p className="text-foreground/90 mb-2">
                {t.reservation.step2VerifyPhone}
              </p>
              <p className="text-foreground/70 text-sm mb-4">
                {t.reservation.verifyPhoneToComplete}
              </p>
              <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                {!phoneOtpSent ? (
                  <>
                    <div className="w-full text-left">
                      <label
                        htmlFor="verify-phone"
                        className="block text-sm font-medium text-foreground/90 mb-1"
                      >
                        {t.reservation.phone}
                      </label>
                      <input
                        id="verify-phone"
                        type="tel"
                        value={signInPhone}
                        onChange={(e) => {
                          setSignInPhone(e.target.value);
                          setPhoneAuthError("");
                        }}
                        placeholder="+40 712 345 678"
                        className="w-full rounded-lg border border-accent/30 bg-background px-4 py-3 text-foreground placeholder:text-foreground/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
                      />
                      <p className="text-xs text-foreground/60 mt-1">
                        {t.reservation.phoneFormatHint}
                      </p>
                      {signInPhone.trim() && (
                        <p className="text-xs text-foreground/70 mt-2">
                          {t.reservation.codeWillBeSentTo.replace(
                            "{number}",
                            toE164(signInPhone),
                          )}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={
                        authLoading || !signInPhone.trim() || isSendingOtp
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-white font-medium shadow hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed border border-accent"
                    >
                      {isSendingOtp && (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      )}
                      <span>{t.reservation.sendCode}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-full text-left">
                      <p className="text-xs text-foreground/70 mb-2">
                        {t.reservation.codeSentTo.replace(
                          "{number}",
                          toE164(signInPhone),
                        )}
                      </p>
                      <label
                        htmlFor="verify-otp"
                        className="block text-sm font-medium text-foreground/90 mb-1"
                      >
                        {t.reservation.enterCode}
                      </label>
                      <input
                        id="verify-otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={otpCode}
                        onChange={(e) => {
                          setOtpCode(
                            e.target.value.replace(/\D/g, "").slice(0, 6),
                          );
                          setPhoneAuthError("");
                        }}
                        placeholder="123456"
                        className="w-full rounded-lg border border-accent/30 bg-background px-4 py-3 text-foreground placeholder:text-foreground/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <button
                        type="button"
                        onClick={handleConfirmOtp}
                        disabled={
                          authLoading || otpCode.length < 6 || isConfirmingOtp
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-white font-medium shadow hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed border border-accent"
                      >
                        {isConfirmingOtp && (
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        )}
                        <span>{t.reservation.verifyCode}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          resetPhoneOtp();
                          setOtpCode("");
                          setSignInPhone("");
                        }}
                        className="rounded-lg border border-accent/40 bg-transparent px-4 py-3 text-accent hover:bg-accent/10 transition"
                      >
                        {t.reservation.changeNumber}
                      </button>
                    </div>
                  </>
                )}
                {phoneAuthError && (
                  <p className="text-sm text-red-500" role="alert">
                    {phoneAuthError}
                  </p>
                )}
              </div>
            </div>
          )}

          {submitted && (
            <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-emerald-500/60 bg-emerald-500/90 px-4 py-3 text-emerald-50 font-medium flex items-center gap-2 shadow-lg animate-[fadeIn_0.3s_ease-out]">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-black text-xs">
                ✓
              </span>
              <span>{t.reservation.successMessage}</span>
            </div>
          )}

          {phoneVerified && (
            <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-emerald-500/60 bg-emerald-500/90 px-4 py-3 text-emerald-50 font-medium flex items-center gap-2 shadow-lg animate-[fadeIn_0.3s_ease-out]">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-black text-xs">
                ✓
              </span>
              <span>
                {t.reservation.phoneVerified ??
                  "Phone verified — your account is ready!"}
              </span>
            </div>
          )}

          {showChooseTypeNotification && (
            <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-red-500/70 bg-red-600/95 px-5 py-3 text-sm font-semibold text-white shadow-lg animate-[fadeIn_0.3s_ease-out]">
              Alege mai întâi PS5 sau PC,
            </div>
          )}

          {user && !user.needsPhoneVerification && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div ref={typeSectionRef}>
                <label className="block text-sm font-medium text-foreground/90 mb-3">
                  {t.reservation.selectType}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setType("ps5");
                      setSelectedStations([]);
                    }}
                    className={`relative overflow-hidden rounded-xl border-2 p-6 text-left transition ${
                      type === "ps5"
                        ? "border-accent bg-accent/10 led-border-subtle"
                        : "border-accent/40 bg-foreground/5 hover:border-accent/60 hover:led-border-subtle"
                    }`}
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                      <Image
                        src={PS5_IMAGE}
                        alt="PS5"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                        quality={90}
                      />
                    </div>
                    <span className="font-semibold text-foreground">
                      {t.reservation.ps5Label}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType("pc");
                      setSelectedStations([]);
                    }}
                    className={`relative overflow-hidden rounded-xl border-2 p-6 text-left transition ${
                      type === "pc"
                        ? "border-accent bg-accent/10 led-border-subtle"
                        : "border-accent/40 bg-foreground/5 hover:border-accent/60 hover:led-border-subtle"
                    }`}
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                      <Image
                        src={PC_IMAGE}
                        alt="PC"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                        quality={90}
                      />
                    </div>
                    <span className="font-semibold text-foreground">
                      {t.reservation.pcLabel}
                    </span>
                  </button>
                </div>
                {showTypeHint && !type && (
                  <p className="mt-2 text-sm text-red-500">
                    {t.reservation.validation.chooseType}
                  </p>
                )}
              </div>

              {type && (
                <div ref={stationSectionRef}>
                  <label className="block text-sm font-medium text-foreground/90 mb-3">
                    {t.reservation.selectStations} (
                    {type === "ps5"
                      ? t.reservation.ps5Label
                      : t.reservation.pcLabel}
                    )
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {stations.map((num) => {
                      const isReserved = reservedStationNums.includes(num);
                      const isSelected = selectedStations.includes(num);
                      const toggleStation = () => {
                        if (isReserved) return;
                        setSelectedStations((prev) =>
                          isSelected
                            ? prev.filter((s) => s !== num)
                            : [...prev, num].sort((a, b) => a - b),
                        );
                      };
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={toggleStation}
                          disabled={isReserved}
                          title={
                            isReserved
                              ? t.reservation.stationReserved
                              : t.reservation.stationAvailable
                          }
                          className={`${type === "ps5" ? "w-20 h-16" : "w-14 h-14"} relative rounded-xl border-2 font-bold text-lg transition flex items-center justify-center ${
                            isReserved
                              ? "border-foreground/30 bg-foreground/10 text-foreground/50 cursor-not-allowed"
                              : isSelected
                                ? "border-accent bg-accent text-white led-glow"
                                : "border-accent/40 bg-foreground/5 text-foreground hover:border-accent/60"
                          }`}
                        >
                          <span className="leading-none">{num}</span>
                          {type === "ps5" && num === 5 && !isReserved && (
                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded bg-accent/15 px-1 py-0.5 text-[8px] font-medium text-accent/80 leading-none text-center whitespace-nowrap">
                              {t.games.steeringWheelTitle}
                            </span>
                          )}
                          {isReserved && (
                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded bg-foreground/20 px-1 py-0.5 text-[9px] font-medium uppercase tracking-wide text-foreground/80 leading-none whitespace-nowrap">
                              {t.reservation.stationReserved}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <p className="text-sm text-foreground/80">
                {t.reservation.reservedSlotsFor}{" "}
                <strong className="text-foreground">{displayDate}</strong>
              </p>
              <div className="grid gap-6 sm:grid-cols-2" ref={timeSectionRef}>
                <div>
                  <label
                    htmlFor="time"
                    className="block text-sm font-medium text-foreground/90 mb-2"
                  >
                    {t.reservation.time} <span className="text-accent">*</span>
                  </label>
                  {/*
                  Only allow starting times that are at least MIN_ADVANCE_HOURS in the future
                  when the selected date is today.
                */}
                  {(() => {
                    const now = new Date();
                    const nowMinutes = now.getHours() * 60 + now.getMinutes();
                    const minStartHourToday = Math.ceil(
                      (nowMinutes + MIN_ADVANCE_HOURS * 60) / 60,
                    );
                    const isToday = displayDate === todayIso;
                    return (
                      <select
                        id="time"
                        required
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full rounded-lg border border-accent/30 bg-background px-4 py-3 text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
                      >
                        <option value="">--</option>
                        {HOURS.map((h) => {
                          if (isToday && h < minStartHourToday) {
                            return null;
                          }
                          const timeVal = `${String(h).padStart(2, "0")}:00`;
                          return (
                            <option key={h} value={timeVal}>
                              {timeVal}
                            </option>
                          );
                        })}
                      </select>
                    );
                  })()}
                </div>
                <div>
                  <label
                    htmlFor="duration"
                    className="block text-sm font-medium text-foreground/90 mb-2"
                  >
                    {t.reservation.duration}
                  </label>
                  <select
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full rounded-lg border border-accent/30 bg-background px-4 py-3 text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    <option value="1">{t.reservation.duration1h}</option>
                    <option value="2">{t.reservation.duration2h}</option>
                    <option value="3">{t.reservation.duration3h}</option>
                    <option value="4">{t.reservation.duration4h}</option>
                    <option value="5">{t.reservation.duration5h}</option>
                    <option value="6">{t.reservation.duration6h}</option>
                    <option value="7">{t.reservation.duration7h}</option>
                    <option value="8">{t.reservation.duration8h}</option>
                  </select>
                </div>
              </div>

              <div
                ref={nameSectionRef}
                className="rounded-xl border border-accent/40 bg-foreground/5 p-6 space-y-4"
              >
                <h3 className="font-semibold text-accent">
                  {t.reservation.yourDetails}
                </h3>
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground/90 mb-2"
                  >
                    {t.reservation.yourName}{" "}
                    <span className="text-accent">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    maxLength={MAX_NAME_LENGTH}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-accent/30 bg-background px-4 py-3 text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                  <p className="text-xs text-foreground/60 mt-1">
                    {name.length}/{MAX_NAME_LENGTH}{" "}
                    {t.reservation.nameMaxLength ?? "characters max"}
                  </p>
                </div>
                {submitError && (
                  <p className="text-sm text-red-500" role="alert">
                    {submitError}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-8 py-3 font-medium text-white transition-all hover:bg-(--accent-hover) led-glow disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                >
                  {isSubmitting && (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}
                  <span>{t.reservation.submit}</span>
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <label
                  htmlFor="calendar-date"
                  className="text-sm font-medium text-foreground/90"
                >
                  {t.reservation.reservedSlotsFor}
                </label>
                <input
                  id="calendar-date"
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={displayDate}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-lg border border-accent/30 bg-background px-4 py-2.5 text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>

              <div
                ref={reservedSlotsRef}
                className="mt-4 rounded-xl border border-accent/40 bg-foreground/5 p-4"
              >
                <h3 className="font-semibold text-accent led-text mb-1">
                  {t.reservation.reservedSlots} — {displayDate}
                </h3>
                <p className="text-xs text-foreground/60 mb-4">
                  {t.reservation.deleteReservationHint}
                </p>
                {isLoadingReservations ? (
                  <p className="text-sm text-foreground/70 flex items-center gap-2">
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
                    {"Loading reservations..."}
                  </p>
                ) : reservedForDate.length === 0 ? (
                  <p className="text-sm text-foreground/70">
                    {t.reservation.reservedSlotsEmpty}
                  </p>
                ) : (
                  (() => {
                    const { ps5, pc } = getDayCalendarGrid(reservations);
                    return (
                      <div className="space-y-6">
                        <DayCalendarTable
                          title={t.reservation.ps5Label}
                          stationCount={5}
                          grid={ps5}
                          t={t}
                          currentUserId={user?.uid}
                          onDelete={handleDeleteReservation}
                          deletingId={deletingId}
                        />
                        <DayCalendarTable
                          title={t.reservation.pcLabel}
                          stationCount={9}
                          grid={pc}
                          t={t}
                          currentUserId={user?.uid}
                          onDelete={handleDeleteReservation}
                          deletingId={deletingId}
                        />
                      </div>
                    );
                  })()
                )}
                {deleteError && (
                  <p className="mt-3 text-sm text-red-500" role="alert">
                    {deleteError}
                  </p>
                )}
              </div>

              <div className="mt-6">
                <Link
                  href={basePath || "/"}
                  className="text-sm text-foreground/70 hover:text-accent transition"
                >
                  ← {t.reservation.back}
                </Link>
              </div>
            </form>
          )}
        </div>
      </section>

    </main>
  );
}
