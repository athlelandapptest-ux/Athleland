// lib/test.js
import dotenv from "dotenv";
import { Pool } from "@neondatabase/serverless";

// explicitly load .env.local
dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is not set in .env.local or environment");
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Connected to database:", result.rows[0]);
  } catch (err) {
    console.error("❌ Connection error:", err);
  } finally {
    await pool.end();
  }
}

testConnection();
