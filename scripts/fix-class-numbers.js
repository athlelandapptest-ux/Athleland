// scripts/fix-class-numbers.js
/* eslint-disable no-console */
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

// Tagged template to stay consistent
async function sql(strings, ...values) {
  const text = strings.reduce(
    (acc, s, i) => acc + s + (i < values.length ? `$${i + 1}` : ""),
    ""
  );
  const res = await pool.query(text, values);
  return res.rows;
}

async function main() {
  // example: normalize levels or ensure capacity min
  await sql`UPDATE workout_classes SET capacity = 10 WHERE capacity IS NULL`;
  console.log("✅ Fixed null capacities to 10");

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
