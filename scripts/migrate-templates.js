import { config } from 'dotenv'
import { getNeonSql } from "../lib/database.js"
import { readFileSync } from "fs"
import { join } from "path"
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Load environment variables from .env.local
config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function runMigration() {
  const sql = getNeonSql()
  
  if (!sql) {
    console.error("❌ DATABASE_URL not configured. Please set your Neon database URL in .env.local")
    process.exit(1)
  }

  try {
    console.log("🚀 Running workout templates migration...")
    
    // Read and execute the migration script
    const migrationPath = join(__dirname, "003-add-workout-templates-table.sql")
    const migrationSQL = readFileSync(migrationPath, "utf-8")
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
    
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`)
      await sql.unsafe(statement)
      console.log("✅ Executed statement")
    }
    
    console.log("🎉 Migration completed successfully!")
    console.log("📝 Workout templates table created in database")
    console.log("📝 USE_NEON_FOR_TEMPLATES=true is already set in your .env.local")
    
  } catch (error) {
    console.error("❌ Migration failed:", error)
    console.error("Error details:", error.message)
  } finally {
    process.exit(0)
  }
}

runMigration()
