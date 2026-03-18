import { Router, Request, Response } from "express";
import { verifySessionToken, isAuthConfigured } from "../auth/google";
import { getProfileByUid, getOrCreateUser } from "../users/store";
import {
  getReservationsForDate,
  saveReservation,
  deleteReservationForUser,
  type Reservation,
} from "./store";

const router = Router();
const MAX_NAME_LENGTH = 50;
const MIN_ADVANCE_HOURS = 1;

function getBearerToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.slice(7).trim() || null;
}

/**
 * GET /api/reservations?date=YYYY-MM-DD
 */
router.get("/", async (req: Request, res: Response) => {
  const date = req.query.date as string;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "Valid date query (YYYY-MM-DD) is required" });
  }
  try {
    const reservations = await getReservationsForDate(date);
    res.json({ reservations });
  } catch (err) {
    console.error("[reservations] getReservationsForDate failed:", err);
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
});

/**
 * POST /api/reservations
 * Authorization: Bearer <session JWT>
 * Body: { type, station, date, time, duration, name }
 */
router.post("/", async (req: Request, res: Response) => {
  if (!isAuthConfigured()) {
    return res.status(503).json({
      error: "Authentication service is not configured",
      hint: "Set GOOGLE_CLIENT_ID and JWT_SECRET in .env",
    });
  }
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Authorization required" });
  }

  let sub: string;
  let email: string | null = null;
  let displayName: string | null = null;
  try {
    const decoded = verifySessionToken(token);
    sub = decoded.sub;
    email = decoded.email ?? null;
    displayName = decoded.name ?? null;
  } catch (err) {
    console.error("[reservations] verify token failed:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  let profile = await getProfileByUid(sub);
  if (!profile) {
    await getOrCreateUser(sub, email, displayName);
    profile = await getProfileByUid(sub);
  }
  if (!profile) {
    return res.status(500).json({ error: "Failed to load or create user profile" });
  }
  const phone = profile.phone?.trim() || "";
  const emailFromProfile = profile.email?.trim() || "";

  const body = req.body as Partial<
    Omit<Reservation, "id" | "createdAt" | "phone" | "email"> & { userId?: string }
  >;
  const { type, station, date, time, duration, name, userId } = body;

  console.log("[reservations] POST /api/reservations payload:", {
    sub,
    emailFromProfile,
    phone,
    body,
  });

  if (!type || (type !== "ps5" && type !== "pc")) {
    return res.status(400).json({ error: "type must be 'ps5' or 'pc'" });
  }
  if (typeof station !== "number" || station < 1) {
    return res.status(400).json({ error: "station must be a positive number" });
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "date must be YYYY-MM-DD" });
  }
  if (!time || typeof time !== "string") {
    return res.status(400).json({ error: "time is required" });
  }
  if (typeof duration !== "number" || duration < 1) {
    return res.status(400).json({ error: "duration must be a positive number" });
  }
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "name is required" });
  }
  const trimmedName = name.trim();
  if (trimmedName.length > MAX_NAME_LENGTH) {
    return res.status(400).json({
      error: `name must be at most ${MAX_NAME_LENGTH} characters`,
    });
  }

  const now = new Date();
  const reservationStart = new Date(`${date}T${time}:00`);
  if (Number.isNaN(reservationStart.getTime())) {
    return res.status(400).json({ error: "Invalid date or time" });
  }
  const diffMs = reservationStart.getTime() - now.getTime();
  const minMs = MIN_ADVANCE_HOURS * 60 * 60 * 1000;
  if (diffMs < minMs) {
    const unit = MIN_ADVANCE_HOURS === 1 ? "hour" : "hours";
    return res.status(400).json({
      error: `Reservations must be made at least ${MIN_ADVANCE_HOURS} ${unit} in advance`,
    });
  }

  try {
    const reservation = await saveReservation({
      type,
      station,
      date,
      time,
      duration,
      name: trimmedName,
      phone,
      email: emailFromProfile,
      ...(userId ?? sub ? { userId: userId ?? sub } : {}),
    });
    res.status(201).json({ reservation });
  } catch (err) {
    console.error("[reservations] saveReservation failed:", err);
    res.status(500).json({ error: "Failed to save reservation" });
  }
});

/**
 * DELETE /api/reservations/:id
 * Authorization: Bearer <session JWT>
 */
router.delete("/:id", async (req: Request, res: Response) => {
  if (!isAuthConfigured()) {
    return res.status(503).json({
      error: "Authentication service is not configured",
    });
  }
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Authorization required" });
  }

  let sub: string;
  try {
    const decoded = verifySessionToken(token);
    sub = decoded.sub;
  } catch (err) {
    console.error("[reservations] verify token failed (DELETE):", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const id = req.params.id as string;
  if (!id) {
    return res.status(400).json({ error: "Reservation id is required" });
  }

  try {
    const deleted = await deleteReservationForUser(id, sub);
    if (!deleted) {
      return res.status(404).json({ error: "Reservation not found" });
    }
    return res.status(204).send();
  } catch (err) {
    console.error("[reservations] deleteReservationForUser failed:", err);
    return res.status(500).json({ error: "Failed to delete reservation" });
  }
});

export default router;
