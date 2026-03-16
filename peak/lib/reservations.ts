import { apiFetch, apiFetchWithAuth } from "./api";

export const MAX_NAME_LENGTH = 50;
export const MIN_ADVANCE_HOURS = 1;

export type Reservation = {
  id: string;
  type: "ps5" | "pc";
  station: number;
  date: string;
  time: string;
  duration: number;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
  userId?: string;
};

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export async function getReservationsForDate(date: string): Promise<Reservation[]> {
  const data = await apiFetch<{ reservations: Reservation[] }>(
    `/api/reservations?date=${encodeURIComponent(date)}`
  );
  return data?.reservations ?? [];
}

/** Payload for creating a reservation. Phone/email come from profile when token is sent. */
export type SaveReservationPayload = {
  type: "ps5" | "pc";
  station: number;
  date: string;
  time: string;
  duration: number;
  name: string;
};

export async function saveReservation(
  payload: SaveReservationPayload,
  token: string | null
): Promise<Reservation> {
  if (!token) throw new Error("You must be signed in to make a reservation");
  const data = await apiFetchWithAuth<{ reservation: Reservation }>(
    `/api/reservations`,
    token,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  if (!data?.reservation) throw new Error("No reservation returned from backend");
  return data.reservation;
}

export async function deleteReservation(
  id: string,
  token: string | null
): Promise<void> {
  if (!token) throw new Error("You must be signed in to delete a reservation");
  await apiFetchWithAuth<void>(`/api/reservations/${id}`, token, {
    method: "DELETE",
  });
}

/** Returns station numbers that are reserved in the given slot (overlap with time + duration). */
export function getReservedStationsForSlot(
  reservations: Reservation[],
  type: "ps5" | "pc",
  time: string,
  duration: number
): number[] {
  const startMin = timeToMinutes(time);
  const endMin = startMin + duration * 60;
  const ofType = reservations.filter((r) => r.type === type);
  const reserved = new Set<number>();
  for (const r of ofType) {
    const rStart = timeToMinutes(r.time);
    const rEnd = rStart + r.duration * 60;
    if (startMin < rEnd && endMin > rStart) reserved.add(r.station);
  }
  return Array.from(reserved);
}

export type DayGrid = {
  ps5: Record<number, Record<number, Reservation | null>>;
  pc: Record<number, Record<number, Reservation | null>>;
};

export const DAY_HOURS = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23] as const;

/** Build calendar grid for one day from a list of reservations (assumed for that day). */
export function getDayCalendarGrid(reservations: Reservation[]): DayGrid {
  const ps5: Record<number, Record<number, Reservation | null>> = {};
  const pc: Record<number, Record<number, Reservation | null>> = {};
  for (const h of DAY_HOURS) {
    ps5[h] = {};
    pc[h] = {};
    for (let s = 1; s <= 5; s++) ps5[h][s] = null;
    for (let s = 1; s <= 9; s++) pc[h][s] = null;
  }
  for (const r of reservations) {
    const startMin = timeToMinutes(r.time);
    const endMin = startMin + r.duration * 60;
    const grid = r.type === "ps5" ? ps5 : pc;
    for (const h of DAY_HOURS) {
      const slotStart = h * 60;
      const slotEnd = (h + 1) * 60;
      if (startMin < slotEnd && endMin > slotStart) {
        grid[h][r.station] = r;
      }
    }
  }
  return { ps5, pc };
}
