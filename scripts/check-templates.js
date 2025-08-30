import { config } from 'dotenv'
import { getNeonSql } from "../lib/database.js"

// Load environment variables from .env.local
config({ path: '.env.local' })

async function checkTemplates() {
  const sql = getNeonSql()
  
  try {
    console.log("🔍 Checking existing workout templates...")
    
    const templates = await sql`SELECT * FROM workout_templates ORDER BY created_at`
    
    console.log(`📊 Found ${templates.length} templates in database:`)
    
    if (templates.length > 0) {
      templates.forEach((template, index) => {
        console.log(`   ${index + 1}. ${template.title} (ID: ${template.id})`)
      })
    } else {
      console.log("   No templates found - database is empty")
    }
    
    // Insert a test template
    console.log("\n🧪 Inserting test template...")
    
    const testTemplate = {
      id: 'test-template-' + Date.now(),
      title: 'Test HYROX Prep Workout',
      description: 'A test workout for database verification',
      rounds: JSON.stringify([
        {
          exercises: [
            { name: 'Burpee Box Jump-Overs', reps: 20, type: 'reps' },
            { name: 'Rowing', duration: 60, type: 'time' }
          ]
        }
      ]),
      hyrox_prep_types: ['Functional Strength', 'Cardio Endurance'],
      hyrox_reasoning: 'Testing database persistence'
    }
    
    await sql`
      INSERT INTO workout_templates (
        id, title, description, rounds, hyrox_prep_types, hyrox_reasoning
      ) VALUES (
        ${testTemplate.id},
        ${testTemplate.title},
        ${testTemplate.description},
        ${testTemplate.rounds}::jsonb,
        ${testTemplate.hyrox_prep_types},
        ${testTemplate.hyrox_reasoning}
      )
    `
    
    console.log("✅ Test template inserted successfully!")
    
    // Verify insertion
    const verification = await sql`SELECT COUNT(*) as count FROM workout_templates`
    console.log(`📊 Total templates after insert: ${verification[0].count}`)
    
  } catch (error) {
    console.error("❌ Error:", error.message)
  } finally {
    process.exit(0)
  }
}

checkTemplates()
