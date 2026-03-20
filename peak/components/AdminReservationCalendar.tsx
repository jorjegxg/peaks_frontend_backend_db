"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  DAY_HOURS,
  getDayCalendarGrid,
  getReservationsForDate,
  type Reservation,
} from "@/lib/reservations";
import {
  banPhone,
  getBannedPhones,
  unbanPhone,
  type BannedPhone,
} from "@/lib/bans";

const ADMIN_PASSWORD = "654321";
const ADMIN_PASSWORD_STORAGE_KEY = "peak_admin_saved_password";

type CalendarTableProps = {
  title: string;
  stationCount: number;
  grid: Record<number, Record<number, Reservation | null>>;
  onBanPhone?: (phone: string) => void;
  isUpdatingBans?: boolean;
};

function CalendarTable({
  title,
  stationCount,
  grid,
  onBanPhone,
  isUpdatingBans,
}: CalendarTableProps) {
  const stations = useMemo(
    () => Array.from({ length: stationCount }, (_, i) => i + 1),
    [stationCount],
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-accent/30 bg-foreground/5 p-4">
      <h2 className="mb-3 text-lg font-semibold text-accent">{title}</h2>
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-accent/30">
            <th className="w-16 py-2 pr-2 text-left font-medium text-foreground/80">
              Time
            </th>
            {stations.map((station) => (
              <th
                key={station}
                className="w-[180px] px-2 py-2 text-left font-medium text-foreground/80"
              >
                Station #{station}
                {title === "PS5" && station === 5 && (
                  <div className="text-xs text-accent/70 font-normal">
                    volan
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAY_HOURS.map((hour) => (
            <tr
              key={hour}
              className="border-b border-foreground/10 align-top hover:bg-foreground/5"
            >
              <td className="py-2 pr-2 tabular-nums text-foreground/70">
                {String(hour).padStart(2, "0")}:00
              </td>
              {stations.map((station) => {
                const reservation = grid[hour][station];
                if (!reservation) {
                  return (
                    <td key={station} className="px-2 py-2 text-foreground/30">
                      -
                    </td>
                  );
                }

                return (
                  <td key={station} className="px-2 py-2">
                    <div className="rounded-lg border border-accent/30 bg-accent/10 p-2 text-xs">
                      <p className="font-semibold text-foreground">
                        {reservation.name}
                      </p>
                      <p>
                        Phone:{" "}
                        <a
                          href={`tel:${reservation.phone}`}
                          className="text-accent underline underline-offset-2 hover:opacity-80"
                        >
                          {reservation.phone}
                        </a>
                      </p>
                      <p className="break-all">Email: {reservation.email}</p>
                      {onBanPhone && (
                        <button
                          type="button"
                          onClick={() => onBanPhone(reservation.phone)}
                          disabled={isUpdatingBans}
                          className="mt-2 rounded border border-red-500/60 px-2 py-1 text-red-400 hover:bg-red-500/10 disabled:opacity-60"
                        >
                          Ban phone
                        </button>
                      )}
                    </div>
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

export function AdminReservationCalendar() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [rememberPassword, setRememberPassword] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState("");
  const [bannedPhones, setBannedPhones] = useState<BannedPhone[]>([]);
  const [banError, setBanError] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banPhoneInput, setBanPhoneInput] = useState("");
  const [isUpdatingBans, setIsUpdatingBans] = useState(false);

  useEffect(() => {
    try {
      const savedPassword = window.localStorage.getItem(
        ADMIN_PASSWORD_STORAGE_KEY,
      );
      if (savedPassword) {
        setPassword(savedPassword);
        setRememberPassword(true);
      }
    } catch {
      // localStorage can be unavailable in private contexts
    }
  }, []);

  useEffect(() => {
    if (!isUnlocked) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    getReservationsForDate(date)
      .then((list) => {
        if (!cancelled) setReservations(list);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load reservations for this date.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date, isUnlocked]);

  useEffect(() => {
    if (!isUnlocked) return;
    let cancelled = false;
    setBanError("");
    getBannedPhones(ADMIN_PASSWORD)
      .then((list) => {
        if (!cancelled) setBannedPhones(list);
      })
      .catch(() => {
        if (!cancelled) setBanError("Could not load banned phone list.");
      });
    return () => {
      cancelled = true;
    };
  }, [isUnlocked]);

  const refreshBans = async () => {
    const list = await getBannedPhones(ADMIN_PASSWORD);
    setBannedPhones(list);
  };

  const onUnlock = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== ADMIN_PASSWORD) {
      setAuthError("Wrong password");
      return;
    }
    try {
      if (rememberPassword) {
        window.localStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, password);
      } else {
        window.localStorage.removeItem(ADMIN_PASSWORD_STORAGE_KEY);
      }
    } catch {
      // Ignore storage write errors
    }
    setAuthError("");
    setIsUnlocked(true);
    if (!rememberPassword) {
      setPassword("");
    }
  };

  const onBanPhone = async (phoneRaw: string) => {
    const normalized = phoneRaw.replace(/\s/g, "").trim();
    if (!normalized) return;
    try {
      setIsUpdatingBans(true);
      setBanError("");
      await banPhone(ADMIN_PASSWORD, normalized, banReason);
      setBanReason("");
      setBanPhoneInput("");
      await refreshBans();
    } catch {
      setBanError("Could not ban this phone number.");
    } finally {
      setIsUpdatingBans(false);
    }
  };

  const onUnbanPhone = async (phone: string) => {
    try {
      setIsUpdatingBans(true);
      setBanError("");
      await unbanPhone(ADMIN_PASSWORD, phone);
      await refreshBans();
    } catch {
      setBanError("Could not unban this phone number.");
    } finally {
      setIsUpdatingBans(false);
    }
  };

  if (!isUnlocked) {
    return (
      <main className="min-h-screen bg-grid-led bg-background px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-accent/40 bg-foreground/5 p-6">
          <h1 className="text-2xl font-bold text-foreground">
            <span className="text-accent">Admin</span> access
          </h1>
          <p className="mt-2 text-sm text-foreground/70">
            Enter the admin password to view reservation contact details.
          </p>

          <form onSubmit={onUnlock} className="mt-5 space-y-3">
            <label
              htmlFor="admin-password"
              className="block text-sm text-foreground/90"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (authError) setAuthError("");
              }}
              className="w-full rounded-lg border border-accent/30 bg-background px-4 py-2.5 text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
              autoComplete="current-password"
            />
            <label className="flex items-center gap-2 text-sm text-foreground/80">
              <input
                type="checkbox"
                checked={rememberPassword}
                onChange={(e) => setRememberPassword(e.target.checked)}
                className="h-4 w-4 rounded border-accent/40 bg-background"
              />
              Remember password on this device
            </label>
            {authError && <p className="text-sm text-red-500">{authError}</p>}
            <button
              type="submit"
              className="w-full rounded-lg bg-accent px-4 py-2.5 font-medium text-white hover:opacity-90"
            >
              Enter admin page
            </button>
          </form>
          <div className="mt-4">
            <Link
              href="/"
              className="text-sm text-foreground/70 hover:text-accent"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { ps5, pc } = getDayCalendarGrid(reservations);

  return (
    <main className="min-h-screen bg-grid-led bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              <span className="text-accent">Admin</span> reservations
            </h1>
            <p className="mt-1 text-sm text-foreground/70">
              Calendar with display name, phone, and email for each reservation.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label
              htmlFor="admin-date"
              className="text-sm font-medium text-foreground/90"
            >
              Date
            </label>
            <input
              id="admin-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-accent/30 bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-foreground/70">Loading reservations...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="space-y-6">
            <CalendarTable
              title="PS5"
              stationCount={5}
              grid={ps5}
              onBanPhone={(phone) => void onBanPhone(phone)}
              isUpdatingBans={isUpdatingBans}
            />
            <CalendarTable
              title="PC"
              stationCount={9}
              grid={pc}
              onBanPhone={(phone) => void onBanPhone(phone)}
              isUpdatingBans={isUpdatingBans}
            />
            <section className="rounded-xl border border-accent/30 bg-foreground/5 p-4">
              <h2 className="text-lg font-semibold text-accent">Banned phones</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="Phone to ban (+40...)"
                  value={banPhoneInput}
                  onChange={(e) => setBanPhoneInput(e.target.value)}
                  className="rounded-lg border border-accent/30 bg-background px-3 py-2 text-sm text-foreground"
                />
                <input
                  type="text"
                  placeholder="Reason (optional)"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="rounded-lg border border-accent/30 bg-background px-3 py-2 text-sm text-foreground"
                />
                <button
                  type="button"
                  onClick={() => void onBanPhone(banPhoneInput)}
                  disabled={isUpdatingBans || !banPhoneInput.trim()}
                  className="rounded-lg border border-red-500/60 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-60"
                >
                  Ban number
                </button>
              </div>
              {banError && <p className="mt-2 text-sm text-red-500">{banError}</p>}
              {bannedPhones.length === 0 ? (
                <p className="mt-3 text-sm text-foreground/70">No banned phones.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {bannedPhones.map((item) => (
                    <li
                      key={item.phone}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-accent/20 bg-background/40 px-3 py-2"
                    >
                      <div>
                        <p className="font-medium text-foreground">{item.phone}</p>
                        {item.reason && (
                          <p className="text-foreground/70">Reason: {item.reason}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => void onUnbanPhone(item.phone)}
                        disabled={isUpdatingBans}
                        className="rounded border border-accent/50 px-2 py-1 text-accent hover:bg-accent/10 disabled:opacity-60"
                      >
                        Unban
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
