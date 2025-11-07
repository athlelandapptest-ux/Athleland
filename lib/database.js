// lib/database.js
// Works in both app/ and pages/ routers (no "server-only" import)

let _pool = null;

/**
 * getNeonSql()
 * Returns a sql`...` tagged template backed by node-postgres.
 * Usage:
 *   const sql = getNeonSql();
 *   const rows = await sql`SELECT * FROM classes WHERE id = ${id}`;
 */
export function getNeonSql() {
  // Hard guard: never allow DB calls in the browser bundle
  if (typeof window !== "undefined") {
    throw new Error("getNeonSql() must be used on the server only.");
  }

  // Lazy-require 'pg' so importing this file in client code doesn't crash build
  if (!_pool) {
    const { Pool } = require("pg");
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Neon usually requires SSL
    });
  }

  // Simple sql tagged template helper (pg uses $1, $2 placeholders)
  const sql = async (strings, ...values) => {
    const text = strings.reduce(
      (acc, part, i) => acc + part + (i < values.length ? `$${i + 1}` : ""),
      ""
    );
    const res = await _pool.query(text, values);
    // For convenience, mimic the "neon" shape a bit:
    res.count = res.rowCount;
    return res.rows; // callers expect rows array
  };

  // Optional: allow closing the pool when needed
  sql.end = async () => {
    if (_pool) {
      await _pool.end();
      _pool = null;
    }
  };

  return sql;
}

// --- add this line at the end of lib/database.js ---
export const isNeonAvailable = false;

