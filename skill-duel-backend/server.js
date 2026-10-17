import http from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { env } from "./src/config/env.js";
import { registerSockets } from "./src/sockets/index.js";

const start = async () => {
  await connectDB();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });

  registerSockets(io);

  server.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
};

start();
