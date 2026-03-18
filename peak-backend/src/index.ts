import "./env";
import app from "./app";
import { isAuthConfigured } from "./auth/google";

const PORT = process.env.PORT || 3001;

if (isAuthConfigured()) {
  console.log("[auth] Google OAuth + JWT configured");
} else {
  console.warn(
    "[auth] Auth not configured — set GOOGLE_CLIENT_ID and JWT_SECRET in .env"
  );
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
