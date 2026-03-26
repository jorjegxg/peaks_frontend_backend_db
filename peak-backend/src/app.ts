import cors from "cors";
import express, { Request, Response } from "express";
import authRoutes from "./auth/routes";
import otpRoutes from "./otp/routes";
import reservationRoutes from "./reservations/routes";
import userRoutes from "./users/routes";
import bansRoutes from "./bans/routes";

const app = express();

const allowedOrigins = [
  "https://peak-nu-nine.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://peak-gaming.site",
  "https://www.peak-gaming.site",
  "https://unchivalrous-honoredly-abigail.ngrok-free.dev",
];
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      if (origin.endsWith(".vercel.app")) return cb(null, true);
      return cb(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-admin-password"],
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bans", bansRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Hello from the backend!" });
});

export default app;
