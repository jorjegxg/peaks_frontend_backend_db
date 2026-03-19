import { Router, Request, Response } from "express";
import {
  createSessionToken,
} from "./google";
import { verifyFirebaseIdToken, isFirebaseAuthConfigured } from "./firebase";
import { getOrCreateUser } from "../users/store";

const router = Router();

/**
 * POST /api/auth/firebase
 * Body: { idToken: string }  (Firebase ID token from the frontend)
 * Returns a backend-issued JWT session token + user profile.
 */
router.post("/firebase", async (req: Request, res: Response) => {
  if (!isFirebaseAuthConfigured()) {
    return res.status(503).json({
      errorCode: "AUTH_NOT_CONFIGURED",
      error: "Firebase authentication is not configured",
    });
  }

  const { idToken } = req.body as { idToken?: string };
  if (!idToken || typeof idToken !== "string") {
    return res.status(400).json({
      errorCode: "AUTH_ID_TOKEN_REQUIRED",
      error: "idToken is required",
    });
  }

  try {
    const { uid, email, name } = await verifyFirebaseIdToken(idToken);
    const profile = await getOrCreateUser(uid, email ?? null, name ?? null);
    const token = createSessionToken({ sub: uid, email, name });
    res.json({ token, profile: { ...profile, uid } });
  } catch (err) {
    console.error("[auth] POST /api/auth/firebase failed:", err);
    return res.status(401).json({
      errorCode: "AUTH_INVALID_TOKEN",
      error: "Invalid Firebase token",
    });
  }
});

export default router;
