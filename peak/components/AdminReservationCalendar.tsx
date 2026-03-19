"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  DAY_HOURS,
  getDayCalendarGrid,
  getReservationsForDate,
  type Reservation,
} from "@/lib/reservations";

const ADMIN_PASSWORD = "654321";

type CalendarTableProps = {
  title: string;
  stationCount: number;
  grid: Record<number, Record<number, Reservation | null>>;
};

function CalendarTable({ title, stationCount, grid }: CalendarTableProps) {
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
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState("");

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

  const onUnlock = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== ADMIN_PASSWORD) {
      setAuthError("Wrong password");
      return;
    }
    setAuthError("");
    setIsUnlocked(true);
    setPassword("");
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
              autoComplete="off"
            />
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
            <CalendarTable title="PS5" stationCount={5} grid={ps5} />
            <CalendarTable title="PC" stationCount={9} grid={pc} />
          </div>
        )}
      </div>
    </main>
  );
}
