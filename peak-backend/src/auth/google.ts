import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

let client: OAuth2Client | null = null;

function getGoogleClientId(): string {
  return process.env.GOOGLE_CLIENT_ID || "";
}

function getJwtSecret(): string {
  return process.env.JWT_SECRET || "";
}

function getClient(): OAuth2Client {
  if (!client) {
    client = new OAuth2Client(getGoogleClientId());
  }
  return client;
}

/** True when session JWT signing/verification is available (required for protected API routes). */
export function isAuthConfigured(): boolean {
  return getJwtSecret().length > 0;
}

export async function verifyGoogleToken(
  credential: string
): Promise<{ sub: string; email?: string; name?: string }> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured");
  }
  const ticket = await getClient().verifyIdToken({
    idToken: credential,
    audience: clientId,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.sub) {
    throw new Error("Invalid Google ID token");
  }
  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
  };
}

export function createSessionToken(payload: {
  sub: string;
  email?: string;
  name?: string;
}): string {
  const secret = getJwtSecret();
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifySessionToken(
  token: string
): { sub: string; email?: string; name?: string } {
  const secret = getJwtSecret();
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.verify(token, secret) as {
    sub: string;
    email?: string;
    name?: string;
  };
}
