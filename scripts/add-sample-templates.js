import { config } from 'dotenv'
import { getNeonSql } from "../lib/database.js"

// Load environment variables from .env.local
config({ path: '.env.local' })

async function addSampleTemplates() {
  const sql = getNeonSql()
  
  const sampleTemplates = [
    {
      id: 'hyrox-strength-circuit',
      title: 'HYROX Strength Circuit',
      description: 'High-intensity circuit targeting functional strength movements essential for HYROX competition',
      rounds: JSON.stringify([
        {
          exercises: [
            { name: 'Burpee Box Jump-Overs', reps: 20, type: 'reps' },
            { name: 'Rowing', duration: 500, type: 'distance', unit: 'meters' },
            { name: 'Kettlebell Swings', reps: 30, weight: '20kg', type: 'reps' },
            { name: 'Ski Erg', duration: 500, type: 'distance', unit: 'meters' },
            { name: 'Sled Push', distance: 50, weight: 'bodyweight', type: 'distance', unit: 'meters' }
          ]
        }
      ]),
      hyrox_prep_types: ['Functional Strength', 'Cardio Endurance', 'Power Development'],
      hyrox_reasoning: 'This circuit mirrors key HYROX movements, building the specific strength and endurance patterns needed for competition success.',
      other_hyrox_prep_notes: 'Focus on smooth transitions between exercises. Maintain steady pace rather than sprinting individual movements.'
    },
    {
      id: 'endurance-base-builder',
      title: 'Endurance Base Builder',
      description: 'Aerobic capacity building workout with sustained effort intervals',
      rounds: JSON.stringify([
        {
          exercises: [
            { name: 'Running', duration: 800, type: 'distance', unit: 'meters', pace: 'moderate' },
            { name: 'Rest', duration: 90, type: 'time', unit: 'seconds' },
            { name: 'Bike Erg', duration: 600, type: 'distance', unit: 'meters' },
            { name: 'Rest', duration: 90, type: 'time', unit: 'seconds' },
            { name: 'Rowing', duration: 500, type: 'distance', unit: 'meters' },
            { name: 'Rest', duration: 120, type: 'time', unit: 'seconds' }
          ]
        }
      ]),
      hyrox_prep_types: ['Cardio Endurance', 'Aerobic Capacity'],
      hyrox_reasoning: 'Builds the aerobic base essential for maintaining pace throughout the 8 HYROX stations.',
      other_hyrox_prep_notes: 'Monitor heart rate zones. Should feel challenging but sustainable throughout all rounds.'
    },
    {
      id: 'power-strength-combo',
      title: 'Power & Strength Combo',
      description: 'Explosive power development combined with strength endurance',
      rounds: JSON.stringify([
        {
          exercises: [
            { name: 'Wall Balls', reps: 25, weight: '9kg/6kg', type: 'reps' },
            { name: 'Farmers Carry', distance: 100, weight: '2x24kg/2x16kg', type: 'distance', unit: 'meters' },
            { name: 'Sandbag Lunges', reps: 20, weight: '20kg/15kg', type: 'reps' },
            { name: 'Burpee Broad Jumps', reps: 15, type: 'reps' }
          ]
        }
      ]),
      hyrox_prep_types: ['Functional Strength', 'Power Development', 'Core Stability'],
      hyrox_reasoning: 'Develops explosive power and strength endurance in movement patterns that directly transfer to HYROX performance.',
      other_hyrox_prep_notes: 'Focus on maintaining good form under fatigue. These movements require both power and precision.'
    }
  ]

  try {
    console.log("🚀 Adding sample workout templates to database...")
    
    for (const template of sampleTemplates) {
      await sql`
        INSERT INTO workout_templates (
          id, title, description, rounds, hyrox_prep_types, hyrox_reasoning, other_hyrox_prep_notes
        ) VALUES (
          ${template.id},
          ${template.title},
          ${template.description},
          ${template.rounds}::jsonb,
          ${template.hyrox_prep_types},
          ${template.hyrox_reasoning},
          ${template.other_hyrox_prep_notes}
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          rounds = EXCLUDED.rounds,
          hyrox_prep_types = EXCLUDED.hyrox_prep_types,
          hyrox_reasoning = EXCLUDED.hyrox_reasoning,
          other_hyrox_prep_notes = EXCLUDED.other_hyrox_prep_notes,
          updated_at = CURRENT_TIMESTAMP
      `
      console.log(`✅ Added: ${template.title}`)
    }
    
    // Verify final count
    const finalCount = await sql`SELECT COUNT(*) as count FROM workout_templates`
    console.log(`\n🎯 Total templates in database: ${finalCount[0].count}`)
    
    // Show all templates
    const allTemplates = await sql`SELECT id, title, description FROM workout_templates ORDER BY created_at`
    console.log("\n📋 All templates:")
    allTemplates.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.title} (${t.id})`)
      console.log(`      ${t.description}`)
    })
    
  } catch (error) {
    console.error("❌ Error adding templates:", error.message)
  } finally {
    process.exit(0)
  }
}

addSampleTemplates()
