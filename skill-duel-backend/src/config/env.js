import "dotenv/config";

const required = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL"];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  // Fail fast and loud at startup rather than deep inside a request handler.
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

export const env = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CLIENT_URL: process.env.CLIENT_URL,
  NODE_ENV: process.env.NODE_ENV || "development",
  // Sessions shorter than this earn no XP/badges (set to 0 while testing).
  MIN_SESSION_SECONDS: parseInt(process.env.MIN_SESSION_SECONDS ?? "30", 10),
};
