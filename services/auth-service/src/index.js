require("dotenv").config();

const cors = require("cors");
const express = require("express");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");

const { pool, query } = require("./db");

const PORT = Number(process.env.PORT ?? "4001");
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET ?? "dev_secret_change_me";

const app = express();
app.use(morgan("dev"));
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function authRequired(req, res, next) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

app.get("/health", (req, res) => res.json({ ok: true, service: "auth" }));

app.post(
  "/login",
  asyncHandler(async (req, res) => {
    const usernameRaw = String(req.body?.username ?? "").trim();
    const username = usernameRaw.length ? usernameRaw.slice(0, 64) : "guest";

    const result = await query(
      "INSERT INTO users (username) VALUES (:username) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)",
      { username }
    );
    const userId = result.insertId;
    const userRows = await query("SELECT id, username FROM users WHERE id = :id", { id: userId });
    const user = userRows[0];

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: "7d"
    });

    res.json({ token, user });
  })
);

app.get(
  "/me",
  authRequired,
  asyncHandler(async (req, res) => {
    res.json({ user: { id: req.auth.userId, username: req.auth.username } });
  })
);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, req, res, next) => {
  const status = Number(err.statusCode ?? err.status ?? 500);
  const message = status >= 500 ? "Internal server error" : String(err.message ?? "Request failed");
  if (status >= 500) console.error(err);
  res.status(status).json({ error: message });
});

const server = app.listen(PORT, () => {
  console.log(`auth-service listening on http://localhost:${PORT}`);
});

async function shutdown(signal) {
  console.log(`\n${signal}: shutting down auth-service...`);
  server.close(async () => {
    try {
      await pool.end();
    } catch (e) {
      console.error("Error closing DB pool", e);
    }
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

