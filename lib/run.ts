import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not set in environment");
}

export const sql = neon(process.env.DATABASE_URL);

// Quick test function
export async function testConnection() {
  try {
    const result = await sql`SELECT version(), NOW()`;
    console.log("✅ Connected to Neon!");
    console.log(result);
  } catch (err) {
    console.error("❌ Connection failed:", err);
  }
}
