import dotenv from "dotenv";
import fs from "fs";
import path from "path";

/** peaks/.env only (repo root) */
const envPath = path.resolve(__dirname, "../../.env");

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}
