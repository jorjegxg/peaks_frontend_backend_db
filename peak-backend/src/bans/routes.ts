import { Request, Response, Router } from "express";
import { banPhone, getBannedPhones, unbanPhone } from "./store";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "654321";

function isAdminAuthorized(req: Request): boolean {
  const headerPassword = req.header("x-admin-password")?.trim();
  return !!headerPassword && headerPassword === ADMIN_PASSWORD;
}

function normalizePhone(phone: string): string {
  return phone.replace(/\s/g, "").trim();
}

router.get("/", async (req: Request, res: Response) => {
  if (!isAdminAuthorized(req)) {
    return res.status(401).json({ errorCode: "ADMIN_UNAUTHORIZED", error: "Unauthorized admin request" });
  }
  try {
    const banned = await getBannedPhones();
    return res.json({ banned });
  } catch (err) {
    console.error("[bans] GET failed:", err);
    return res.status(500).json({ errorCode: "BAN_LIST_FETCH_FAILED", error: "Failed to fetch banned phones" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  if (!isAdminAuthorized(req)) {
    return res.status(401).json({ errorCode: "ADMIN_UNAUTHORIZED", error: "Unauthorized admin request" });
  }
  const { phone, reason } = req.body as { phone?: string; reason?: string };
  const normalized = normalizePhone(phone ?? "");
  if (!normalized) {
    return res.status(400).json({ errorCode: "BAN_PHONE_REQUIRED", error: "Phone is required" });
  }
  try {
    await banPhone(normalized, reason);
    return res.status(201).json({ success: true });
  } catch (err) {
    console.error("[bans] POST failed:", err);
    return res.status(500).json({ errorCode: "BAN_SAVE_FAILED", error: "Failed to ban phone" });
  }
});

router.delete("/:phone", async (req: Request, res: Response) => {
  if (!isAdminAuthorized(req)) {
    return res.status(401).json({ errorCode: "ADMIN_UNAUTHORIZED", error: "Unauthorized admin request" });
  }
  const normalized = normalizePhone(req.params.phone ?? "");
  if (!normalized) {
    return res.status(400).json({ errorCode: "BAN_PHONE_REQUIRED", error: "Phone is required" });
  }
  try {
    const deleted = await unbanPhone(normalized);
    if (!deleted) {
      return res.status(404).json({ errorCode: "BAN_NOT_FOUND", error: "Phone is not banned" });
    }
    return res.status(204).send();
  } catch (err) {
    console.error("[bans] DELETE failed:", err);
    return res.status(500).json({ errorCode: "BAN_DELETE_FAILED", error: "Failed to unban phone" });
  }
});

export default router;
