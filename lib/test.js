// lib/test.js
import { Pool } from "pg";

export async function testDb() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  const { rows } = await pool.query("select now() as now");
  return rows[0]?.now || null;
}
