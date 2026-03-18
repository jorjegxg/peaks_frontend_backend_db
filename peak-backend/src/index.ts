import "./env";
import app from "./app";
import { isAuthConfigured } from "./auth/google";
import { isFirebaseAuthConfigured } from "./auth/firebase";

const PORT = process.env.PORT || 3001;

if (isAuthConfigured()) {
  if (isFirebaseAuthConfigured()) {
    console.log("[auth] Firebase sign-in + session JWT configured");
  } else {
    console.log(
      "[auth] Session JWT configured — set FIREBASE_SERVICE_ACCOUNT_JSON to enable Google sign-in"
    );
  }
} else {
  console.warn("[auth] Set JWT_SECRET in peaks/.env for authenticated API routes");
}

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  console.error("Server failed to start:", err.message);
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Try another port or stop the other process.`,
    );
  }
  process.exit(1);
});
