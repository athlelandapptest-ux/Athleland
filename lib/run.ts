// lib/run.ts
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});

// Tagged template helper for TS
export async function sql(strings: TemplateStringsArray, ...values: any[]) {
  const text = strings.reduce(
    (acc, s, i) => acc + s + (i < values.length ? `$${i + 1}` : ""),
    ""
  );
  const res = await pool.query(text, values);
  return res.rows;
}
