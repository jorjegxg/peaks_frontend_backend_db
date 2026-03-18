import { Router, Request, Response } from "express";
import {
  verifyGoogleToken,
  createSessionToken,
  isAuthConfigured,
} from "./google";
import { getOrCreateUser } from "../users/store";

const router = Router();

/**
 * POST /api/auth/google
 * Body: { credential: string }  (Google ID token from the frontend)
 * Returns a backend-issued JWT session token + user profile.
 */
router.post("/google", async (req: Request, res: Response) => {
  if (!isAuthConfigured()) {
    return res.status(503).json({
      error: "Authentication service is not configured",
      hint: "Set GOOGLE_CLIENT_ID and JWT_SECRET in .env",
    });
  }

  const { credential } = req.body as { credential?: string };
  if (!credential || typeof credential !== "string") {
    return res.status(400).json({ error: "credential is required" });
  }

  try {
    const { sub, email, name } = await verifyGoogleToken(credential);
    const profile = await getOrCreateUser(sub, email ?? null, name ?? null);
    const token = createSessionToken({ sub, email, name });
    res.json({ token, profile });
  } catch (err) {
    console.error("[auth] POST /api/auth/google failed:", err);
    return res.status(401).json({ error: "Invalid Google credential" });
  }
});

export default router;
