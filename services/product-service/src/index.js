require("dotenv").config();

const cors = require("cors");
const express = require("express");
const morgan = require("morgan");

const { pool, query } = require("./db");

const PORT = Number(process.env.PORT ?? "4002");
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";

const app = express();
app.use(morgan("dev"));
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function parsePrice(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.round(num * 100) / 100;
}

app.get("/health", (req, res) => res.json({ ok: true, service: "product" }));

app.get(
  "/products",
  asyncHandler(async (req, res) => {
    const rows = await query("SELECT id, name, description, price, image_url FROM products ORDER BY id DESC");
    res.json({ products: rows });
  })
);

app.get(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });
    const rows = await query("SELECT id, name, description, price, image_url FROM products WHERE id = :id", { id });
    if (!rows.length) return res.status(404).json({ error: "Product not found" });
    res.json({ product: rows[0] });
  })
);

app.post(
  "/products",
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name ?? "").trim();
    const description = String(req.body?.description ?? "").trim();
    const image_url = String(req.body?.image_url ?? "").trim();
    const price = parsePrice(req.body?.price);

    if (!name) return res.status(400).json({ error: "Name is required" });
    if (price === null) return res.status(400).json({ error: "Valid price is required" });

    const result = await query(
      "INSERT INTO products (name, description, price, image_url) VALUES (:name, :description, :price, :image_url)",
      { name, description, price, image_url }
    );
    const id = result.insertId;
    const rows = await query("SELECT id, name, description, price, image_url FROM products WHERE id = :id", { id });
    res.status(201).json({ product: rows[0] });
  })
);

app.put(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });

    const name = String(req.body?.name ?? "").trim();
    const description = String(req.body?.description ?? "").trim();
    const image_url = String(req.body?.image_url ?? "").trim();
    const price = parsePrice(req.body?.price);

    if (!name) return res.status(400).json({ error: "Name is required" });
    if (price === null) return res.status(400).json({ error: "Valid price is required" });

    const result = await query(
      "UPDATE products SET name=:name, description=:description, price=:price, image_url=:image_url WHERE id=:id",
      { id, name, description, price, image_url }
    );
    if (!result.affectedRows) return res.status(404).json({ error: "Product not found" });

    const rows = await query("SELECT id, name, description, price, image_url FROM products WHERE id = :id", { id });
    res.json({ product: rows[0] });
  })
);

app.delete(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });
    const result = await query("DELETE FROM products WHERE id = :id", { id });
    if (!result.affectedRows) return res.status(404).json({ error: "Product not found" });
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
  console.log(`product-service listening on http://localhost:${PORT}`);
});

async function shutdown(signal) {
  console.log(`\n${signal}: shutting down product-service...`);
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

