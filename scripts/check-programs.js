import { config } from 'dotenv'
import { getNeonSql } from "../lib/database.js"

// Load environment variables from .env.local
config({ path: '.env.local' })

async function checkPrograms() {
  const sql = getNeonSql()
  
  try {
    console.log("🔍 Checking programs in database...")
    
    const programs = await sql`
      SELECT p.*, 
             COUNT(ph.id) as phase_count
      FROM programs p
      LEFT JOIN program_phases ph ON p.id = ph.program_id
      GROUP BY p.id
      ORDER BY p.created_at ASC
    `
    
    console.log(`📊 Found ${programs.length} programs`)
    
    if (programs.length > 0) {
      for (const program of programs) {
        console.log(`\n📋 Program: ${program.name}`)
        console.log(`   ID: ${program.id}`)
        console.log(`   Subtitle: ${program.subtitle}`)
        console.log(`   Week: ${program.current_week}/${program.total_weeks}`)
        console.log(`   Phases: ${program.phase_count}`)
        console.log(`   Status: ${program.status}`)
        
        // Get phases for this program
        const phases = await sql`
          SELECT * FROM program_phases 
          WHERE program_id = ${program.id}
          ORDER BY phase_order ASC
        `
        
        console.log(`   📊 Phases:`)
        phases.forEach((phase, i) => {
          console.log(`      ${i + 1}. ${phase.name} (Weeks ${phase.start_week}-${phase.end_week}) - ${phase.status}`)
          console.log(`         Focus: ${phase.focus}`)
        })
      }
    } else {
      console.log("❌ No programs found in database")
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message)
  } finally {
    process.exit(0)
  }
}

checkPrograms()
