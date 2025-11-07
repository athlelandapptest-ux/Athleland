// scripts/create-classes-table.js
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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS workout_classes (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      level TEXT,
      coach TEXT,
      location TEXT,
      scheduled_at TIMESTAMPTZ,
      capacity INT,
      notes TEXT,
      template_id BIGINT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  console.log("✅ workout_classes ensured");

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
