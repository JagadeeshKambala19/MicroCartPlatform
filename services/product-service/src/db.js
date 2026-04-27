const mysql = require("mysql2/promise");

function requireEnv(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") throw new Error(`Missing env: ${name}`);
  return value;
}

const pool = mysql.createPool({
  host: requireEnv("DB_HOST", "localhost"),
  port: Number(process.env.DB_PORT ?? "3306"),
  user: requireEnv("DB_USER", "app"),
  password: requireEnv("DB_PASSWORD", "app_password"),
  database: requireEnv("DB_NAME", "ecommerce"),
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  decimalNumbers: true
});

async function query(sql, params = {}) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

module.exports = { pool, query };

