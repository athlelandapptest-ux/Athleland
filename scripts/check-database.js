import { config } from 'dotenv'
import { getNeonSql } from "../lib/database.js"

// Load environment variables from .env.local
config({ path: '.env.local' })

async function checkDatabase() {
  const sql = getNeonSql()
  
  if (!sql) {
    console.error("❌ DATABASE_URL not configured")
    process.exit(1)
  }

  try {
    console.log("🔍 Checking database tables...")
    
    // Check if workout_templates table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'workout_templates'
      )
    `
    
    console.log(`Table 'workout_templates' exists: ${tableCheck[0].exists}`)
    
    if (tableCheck[0].exists) {
      // Count templates
      const count = await sql`
        SELECT COUNT(*) as count FROM workout_templates
      `
      console.log(`Number of templates in database: ${count[0].count}`)
      
      // List all templates
      const templates = await sql`
        SELECT id, title, description, created_at FROM workout_templates
        ORDER BY created_at DESC
      `
      
      console.log("\n📋 Templates in database:")
      templates.forEach((template, index) => {
        console.log(`${index + 1}. ${template.title} (ID: ${template.id})`)
        console.log(`   Description: ${template.description}`)
        console.log(`   Created: ${template.created_at}`)
        console.log("")
      })
    }
    
    // List all tables in the database
    console.log("📂 All tables in database:")
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name}`)
    })
    
  } catch (error) {
    console.error("❌ Database check failed:", error.message)
  } finally {
    process.exit(0)
  }
}

checkDatabase()
