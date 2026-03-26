import { Router, Request, Response } from "express";
import type { SendOtpBody, VerifyOtpBody } from "./types";
import { createOtp, verifyOtp, getOtpTtlSeconds } from "./store";
import { sendOtpSms, isTwilioConfigured } from "./twilio";
import { isPhoneAlreadyUsed } from "../users/store";

const router = Router();

// E.164: digits only, then we add + for Twilio
const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

function normalizePhone(phone: string): string {
  return phone.replace(/\s/g, "").trim();
}

/** Convert normalized phone to E.164.
 * For Romanian numbers:
 *  - "0753532559" -> "+40753532559"
 *  - "753532559"  -> "+40753532559"
 * Other numbers keep all digits and just get a leading "+" if missing.
 */
function toE164(phone: string): string {
  const n = normalizePhone(phone);
  if (n.startsWith("+")) return n;
  const digits = n.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("0")) {
    return `+40${digits.slice(1)}`;
  }
  if (digits.length === 9) {
    return `+40${digits}`;
  }
  return `+${digits}`;
}

function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(normalizePhone(phone ?? ""));
}

/**
 * POST /api/otp/send
 * Body: { phone: string }
 * Sends OTP to the given phone number via Twilio.
 */
router.post("/send", async (req: Request, res: Response) => {
  const { phone } = req.body as SendOtpBody;
  const normalized = normalizePhone(phone ?? "");

  if (!normalized) {
    return res.status(400).json({ errorCode: "PHONE_REQUIRED", error: "Phone number is required" });
  }
  if (!isValidPhone(normalized)) {
    return res.status(400).json({ errorCode: "PHONE_INVALID_FORMAT", error: "Invalid phone number format" });
  }
  const e164 = toE164(normalized);
  const used = await isPhoneAlreadyUsed(e164);
  if (used) {
    return res.status(409).json({
      errorCode: "PHONE_ALREADY_IN_USE",
      error: "Phone number is already used by another account",
    });
  }
  if (!isTwilioConfigured()) {
    return res.status(503).json({ errorCode: "SMS_NOT_CONFIGURED", error: "SMS service is not configured" });
  }

  const code = await createOtp(e164);
  const ttlSeconds = getOtpTtlSeconds();
  const to = e164;

  try {
    console.log("Sending OTP to", to, "with code", code);
    await sendOtpSms(to, code);
  } catch (err) {
    console.error("[OTP] Twilio send failed:", err);
    return res.status(502).json({
      errorCode: "SMS_SEND_FAILED",
      error: "Failed to send verification code",
    });
  }

  res.status(200).json({
    message: "OTP sent",
    expiresInSeconds: ttlSeconds,
  });
});

/**
 * POST /api/otp/verify
 * Body: { phone: string, code: string }
 * Verifies the OTP for the given phone number.
 */
router.post("/verify", async (req: Request, res: Response) => {
  const { phone, code } = req.body as VerifyOtpBody;
  const normalized = normalizePhone(phone ?? "");

  if (!normalized) {
    return res.status(400).json({ errorCode: "PHONE_REQUIRED", error: "Phone number is required" });
  }
  if (!code || typeof code !== "string") {
    return res.status(400).json({ errorCode: "OTP_CODE_REQUIRED", error: "Verification code is required" });
  }

  const valid = await verifyOtp(normalized, code.trim());

  if (!valid) {
    return res.status(400).json({
      errorCode: "OTP_INVALID",
      error: "Invalid or expired code",
      verified: false,
    });
  }

  res.status(200).json({
    message: "Phone verified",
    verified: true,
  });
});

export default router;
