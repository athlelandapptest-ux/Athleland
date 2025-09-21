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

async function runAllMigrations() {
  const sql = getNeonSql()
  
  if (!sql) {
    console.error("❌ DATABASE_URL not configured. Please set your Neon database URL in .env.local")
    process.exit(1)
  }

  try {
    console.log("🚀 Running all database migrations...")
    
    // Migration files in order
    const migrations = [
      "001-create-tables.sql",
      "003-add-workout-templates-table.sql"
    ]
    
    for (const migrationFile of migrations) {
      console.log(`\n📝 Running migration: ${migrationFile}`)
      
      const migrationPath = join(__dirname, migrationFile)
      const migrationSQL = readFileSync(migrationPath, "utf-8")
      
      // Split by semicolon and execute each statement
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))
      
      for (const statement of statements) {
        try {
          console.log(`   Executing: ${statement.substring(0, 60).replace(/\n/g, ' ')}...`)
          await sql.unsafe(statement)
          console.log(`   ✅ Success`)
        } catch (error) {
          // Some errors might be expected (e.g., table already exists)
          if (error.message.includes('already exists')) {
            console.log(`   ⚠️  Skipped (already exists)`)
          } else {
            console.log(`   ❌ Error: ${error.message}`)
          }
        }
      }
      
      console.log(`✅ Migration ${migrationFile} completed`)
    }
    
    console.log("\n🎉 All migrations completed successfully!")
    console.log("🔍 Verifying tables...")
    
    // Verify tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    
    console.log(`\n📂 Created tables (${tables.length}):`)
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name}`)
    })
    
    // Check specifically for workout_templates
    const workoutTemplatesExists = tables.some(t => t.table_name === 'workout_templates')
    console.log(`\n✅ workout_templates table exists: ${workoutTemplatesExists}`)
    
    if (workoutTemplatesExists) {
      console.log("\n🎯 You can now enable USE_NEON_FOR_TEMPLATES=true in .env.local")
    }
    
  } catch (error) {
    console.error("❌ Migration failed:", error)
  } finally {
    process.exit(0)
  }
}

runAllMigrations()
