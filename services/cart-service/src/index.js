require("dotenv").config();

const cors = require("cors");
const express = require("express");
const morgan = require("morgan");

const { pool, query } = require("./db");

const PORT = Number(process.env.PORT ?? "4003");
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";

const app = express();
app.use(morgan("dev"));
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

app.get("/health", (req, res) => res.json({ ok: true, service: "cart" }));

app.get(
  "/cart",
  asyncHandler(async (req, res) => {
    const items = await query(
      `SELECT c.id, c.product_id, c.quantity,
              p.name, p.description, p.price, p.image_url
         FROM cart c
         JOIN products p ON p.id = c.product_id
        ORDER BY c.id DESC`
    );
    res.json({ items });
  })
);

app.post(
  "/cart/items",
  asyncHandler(async (req, res) => {
    const productId = Number(req.body?.productId);
    const qty = Number(req.body?.quantity ?? 1);
    const quantity = Number.isFinite(qty) ? Math.max(1, Math.floor(qty)) : 1;
    if (!Number.isInteger(productId)) return res.status(400).json({ error: "Invalid productId" });

    const productRows = await query("SELECT id FROM products WHERE id=:id", { id: productId });
    if (!productRows.length) return res.status(404).json({ error: "Product not found" });

    const existing = await query("SELECT id, quantity FROM cart WHERE product_id=:productId", { productId });
    if (existing.length) {
      const nextQty = existing[0].quantity + quantity;
      await query("UPDATE cart SET quantity=:quantity WHERE id=:id", { id: existing[0].id, quantity: nextQty });
      const rows = await query("SELECT id, product_id, quantity FROM cart WHERE id=:id", { id: existing[0].id });
      return res.status(200).json({ item: rows[0] });
    }

    const result = await query("INSERT INTO cart (product_id, quantity) VALUES (:productId, :quantity)", {
      productId,
      quantity
    });
    const rows = await query("SELECT id, product_id, quantity FROM cart WHERE id=:id", { id: result.insertId });
    res.status(201).json({ item: rows[0] });
  })
);

app.patch(
  "/cart/items/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });

    const qty = Number(req.body?.quantity);
    if (!Number.isFinite(qty)) return res.status(400).json({ error: "Invalid quantity" });
    const quantity = Math.floor(qty);

    if (quantity <= 0) {
      await query("DELETE FROM cart WHERE id=:id", { id });
      return res.status(204).send();
    }

    const result = await query("UPDATE cart SET quantity=:quantity WHERE id=:id", { id, quantity });
    if (!result.affectedRows) return res.status(404).json({ error: "Cart item not found" });

    const rows = await query("SELECT id, product_id, quantity FROM cart WHERE id=:id", { id });
    res.json({ item: rows[0] });
  })
);

app.delete(
  "/cart/items/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });
    await query("DELETE FROM cart WHERE id=:id", { id });
    res.status(204).send();
  })
);

app.delete(
  "/cart/clear",
  asyncHandler(async (req, res) => {
    await query("DELETE FROM cart");
    res.status(204).send();
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
  console.log(`cart-service listening on http://localhost:${PORT}`);
});

async function shutdown(signal) {
  console.log(`\n${signal}: shutting down cart-service...`);
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

