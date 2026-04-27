require("dotenv").config();

const cors = require("cors");
const express = require("express");
const morgan = require("morgan");

const { pool } = require("./db");

// ================= CONFIG =================
const PORT = Number(process.env.PORT || 4004);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// ================= APP SETUP =================
const app = express();

app.use(morgan("dev"));

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));

app.use(express.json({ limit: "1mb" }));

// ================= HELPERS =================
function asyncHandler(fn) {
  return (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
}

// ================= ROUTES =================
app.get("/health", (req, res) => {
  res.json({ ok: true, service: "order" });
});

app.post(
  "/orders",
  asyncHandler(async (req, res) => {
    const userId = Number(req.body?.userId);

    if (!Number.isInteger(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const [cartItems] = await conn.execute(
        `SELECT c.product_id, c.quantity, p.price
           FROM cart c
           JOIN products p ON p.id = c.product_id`
      );

      if (!cartItems.length) {
        await conn.rollback();
        return res.status(400).json({ error: "Cart is empty" });
      }

      let total = 0;
      for (const item of cartItems) {
        total += Number(item.price) * Number(item.quantity);
      }

      total = Math.round(total * 100) / 100;

      const [orderResult] = await conn.execute(
        "INSERT INTO orders (user_id, total_price) VALUES (?, ?)",
        [userId, total]
      );

      const orderId = orderResult.insertId;

      for (const item of cartItems) {
        await conn.execute(
          "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
          [orderId, item.product_id, item.quantity, item.price]
        );
      }

      await conn.execute("DELETE FROM cart");

      await conn.commit();

      const [orders] = await conn.execute(
        "SELECT id, user_id, total_price, created_at FROM orders WHERE id=?",
        [orderId]
      );

      const [items] = await conn.execute(
        `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.unit_price,
                p.name, p.image_url
           FROM order_items oi
           JOIN products p ON p.id = oi.product_id
          WHERE oi.order_id = ?
          ORDER BY oi.id ASC`,
        [orderId]
      );

      res.status(201).json({ order: orders[0], items });

    } catch (e) {
      try {
        await conn.rollback();
      } catch { }
      throw e;
    } finally {
      conn.release();
    }
  })
);

app.get(
  "/orders",
  asyncHandler(async (req, res) => {
    const userIdRaw = req.query.userId;
    const userId = userIdRaw !== undefined ? Number(userIdRaw) : null;

    const conn = await pool.getConnection();

    try {
      const [orders] =
        userId && Number.isInteger(userId)
          ? await conn.execute(
            "SELECT id, user_id, total_price, created_at FROM orders WHERE user_id=? ORDER BY created_at DESC",
            [userId]
          )
          : await conn.execute(
            "SELECT id, user_id, total_price, created_at FROM orders ORDER BY created_at DESC"
          );

      const orderIds = orders.map((o) => o.id);

      let items = [];

      if (orderIds.length) {
        const placeholders = orderIds.map(() => "?").join(",");

        const [rows] = await conn.execute(
          `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.unit_price,
                  p.name, p.image_url
             FROM order_items oi
             JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id IN (${placeholders})
            ORDER BY oi.order_id DESC, oi.id ASC`,
          orderIds
        );

        items = rows;
      }

      res.json({ orders, items });

    } finally {
      conn.release();
    }
  })
);

app.get(
  "/orders/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const conn = await pool.getConnection();

    try {
      const [orders] = await conn.execute(
        "SELECT id, user_id, total_price, created_at FROM orders WHERE id=?",
        [id]
      );

      if (!orders.length) {
        return res.status(404).json({ error: "Order not found" });
      }

      const [items] = await conn.execute(
        `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.unit_price,
                p.name, p.image_url
           FROM order_items oi
           JOIN products p ON p.id = oi.product_id
          WHERE oi.order_id = ?
          ORDER BY oi.id ASC`,
        [id]
      );

      res.json({ order: orders[0], items });

    } finally {
      conn.release();
    }
  })
);

// ================= ERROR HANDLING =================
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  const status = Number(err.statusCode || err.status || 500);

  const message =
    status >= 500
      ? "Internal server error"
      : String(err.message || "Request failed");

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ error: message });
});

// ================= SERVER START (FIXED) =================
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`order-service running on http://0.0.0.0:${PORT}`);
});

// ================= SHUTDOWN =================
async function shutdown(signal) {
  console.log(`\n${signal}: shutting down order-service...`);

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