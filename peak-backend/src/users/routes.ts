import { Router, Request, Response } from "express";
import { verifySessionToken, isAuthConfigured } from "../auth/google";
import { getOrCreateUser, setUserPhone } from "./store";
import { verifyOtp } from "../otp/store";

const router = Router();

function getBearerToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.slice(7).trim() || null;
}

/**
 * GET /api/users/me
 * Authorization: Bearer <session JWT>
 */
router.get("/me", async (req: Request, res: Response) => {
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
  try {
    const { sub, email, name } = verifySessionToken(token);
    const profile = await getOrCreateUser(sub, email ?? null, name ?? null);
    res.json(profile);
  } catch (err) {
    console.error("[users] GET /me failed:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

/**
 * POST /api/users/me/phone
 * Authorization: Bearer <session JWT>
 * Body: { phone: string, code: string }
 */
router.post("/me/phone", async (req: Request, res: Response) => {
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
  const { phone, code } = req.body as { phone?: string; code?: string };
  const raw = typeof phone === "string" ? phone : "";
  const normalizedPhone = raw.replace(/\s/g, "").trim();
  const e164 = normalizedPhone.startsWith("+") ? normalizedPhone : `+${normalizedPhone}`;
  if (!e164 || e164 === "+") {
    return res.status(400).json({ error: "Phone number is required" });
  }
  if (!code || typeof code !== "string" || !code.trim()) {
    return res.status(400).json({ error: "Verification code is required" });
  }
  try {
    const { sub } = verifySessionToken(token);
    const valid = await verifyOtp(e164, code.trim());
    if (!valid) {
      return res.status(400).json({ error: "Invalid or expired code", verified: false });
    }
    await setUserPhone(sub, e164);
    res.json({ success: true, message: "Phone verified and linked" });
  } catch (err) {
    console.error("[users] POST /me/phone failed:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

export default router;
