import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import matchRoutes from "./routes/match.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import badgeRoutes from "./routes/badge.routes.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";

const app = express();

if (env.NODE_ENV === "production") app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize()); // strips $ and . from req.body/query/params keys
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));

// Rate-limit auth routes specifically — brute-force protection on signin.
const credentialsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === "production" ? 20 : 200,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later." },
});
app.use("/api/auth/signin", credentialsLimiter);
app.use("/api/auth/signup", credentialsLimiter);
app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/badges", badgeRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../skillDuel/dist");
if (env.NODE_ENV === "production" && fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(clientDist, "index.html")));
}
app.use(notFound);
app.use(errorHandler);

export default app;
