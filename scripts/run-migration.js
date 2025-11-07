// scripts/run-migration.js
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

async function runSQL(pool, filePath) {
  const sql = fs.readFileSync(filePath, "utf8");
  console.log(`\n▶ Running ${path.basename(filePath)}...`);
  await pool.query(sql);
  console.log(`✅ Done ${path.basename(filePath)}`);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const migrationsDir = path.join(__dirname, "migrations"); // adjust if needed
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const f of files) {
    await runSQL(pool, path.join(migrationsDir, f));
  }

  await pool.end();
  console.log("\n🎉 All migrations ran successfully.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
