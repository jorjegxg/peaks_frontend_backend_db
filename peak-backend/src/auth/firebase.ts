import admin from "firebase-admin";
import fs from "fs";
import path from "path";

/** peaks/ — works from both src/auth and dist/auth */
function getRepoRoot(): string {
  return path.resolve(__dirname, "../../../");
}

function readServiceAccount(): admin.ServiceAccount | null {
  const inline = (process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "").trim();
  if (inline) {
    try {
      return JSON.parse(inline) as admin.ServiceAccount;
    } catch {
      return null;
    }
  }

  const envPath =
    (process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "").trim() ||
    (process.env.GOOGLE_APPLICATION_CREDENTIALS || "").trim();

  const tryPaths: string[] = [];
  if (envPath) {
    tryPaths.push(
      path.isAbsolute(envPath) ? envPath : path.join(getRepoRoot(), envPath),
    );
  }
  tryPaths.push(
    path.join(getRepoRoot(), "peak", "firebase-service-account.json"),
    path.join(getRepoRoot(), "peak-backend", "firebase-service-account.json"),
    path.join(getRepoRoot(), "firebase-service-account.json"),
  );

  for (const full of tryPaths) {
    if (full && fs.existsSync(full)) {
      try {
        const raw = fs.readFileSync(full, "utf8");
        return JSON.parse(raw) as admin.ServiceAccount;
      } catch {
        return null;
      }
    }
  }
  return null;
}

function ensureApp(): admin.app.App {
  if (admin.apps.length) return admin.apps[0]!;

  const creds = readServiceAccount();
  const c = creds as Record<string, unknown> | null;
  const hasKey = !!(c?.private_key ?? c?.privateKey);
  const hasEmail = !!(c?.client_email ?? c?.clientEmail);
  if (!creds || !hasKey || !hasEmail) {
    throw new Error("Firebase Admin credentials not configured");
  }

  return admin.initializeApp({
    credential: admin.credential.cert(creds),
  });
}

export function isFirebaseAuthConfigured(): boolean {
  try {
    ensureApp();
    return true;
  } catch {
    return false;
  }
}

export async function verifyFirebaseIdToken(idToken: string): Promise<{
  uid: string;
  email?: string;
  name?: string;
}> {
  if (!idToken) throw new Error("Missing Firebase ID token");
  const app = ensureApp();
  const decoded = await app.auth().verifyIdToken(idToken);
  return {
    uid: decoded.uid,
    email: decoded.email,
    name: (decoded as unknown as { name?: string }).name,
  };
}
