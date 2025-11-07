// scripts/check-classes-schema.js
/* eslint-disable no-console */
const { Pool } = require("pg");

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  const { rows } = await pool.query(
    `SELECT column_name, data_type
     FROM information_schema.columns
     WHERE table_schema='public' AND table_name='workout_classes'
     ORDER BY ordinal_position`
  );
  console.table(rows);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
