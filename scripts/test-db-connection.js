import { config } from 'dotenv'
import { getNeonSql } from "../lib/database.js"

// Load environment variables from .env.local
config({ path: '.env.local' })

async function testConnection() {
  const sql = getNeonSql()
  
  if (!sql) {
    console.error("❌ DATABASE_URL not configured")
    process.exit(1)
  }

  try {
    
    const result = await sql`SELECT version(), current_database(), current_user`
    console.log("🎯 Database Connection Info:")
    console.log(`   Version: ${result[0].version}`)
    console.log(`   Database: ${result[0].current_database}`)
    console.log(`   User: ${result[0].current_user}`)
    
    // Try to manually create the workout_templates table
    console.log("\n🔨 Attempting to create workout_templates table manually...")
    
    await sql`
      CREATE TABLE IF NOT EXISTS workout_templates (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        rounds JSONB NOT NULL,
        hyrox_prep_types TEXT[],
        hyrox_reasoning TEXT,
        other_hyrox_prep_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    console.log("✅ workout_templates table created successfully!")
    
    // Verify it exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'workout_templates'
      )
    `
    
    console.log(`✅ Table verification: ${tableCheck[0].exists}`)
    
  } catch (error) {
    console.error("❌ Error:", error.message)
  } finally {
    process.exit(0)
  }
}

testConnection()
