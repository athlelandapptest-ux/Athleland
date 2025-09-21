import { config } from 'dotenv'
import { getNeonSql } from "../lib/database.js"

// Load environment variables from .env.local
config({ path: '.env.local' })

async function addNewProgram() {
  const sql = getNeonSql()
  
  try {
    console.log("🚀 Adding new sample program...")
    
    const newProgram = {
      id: 'strength-building-' + Date.now(),
      name: 'Pure Strength Building',
      subtitle: '8-Week Strength Focused Program',
      description: 'Dedicated strength training program for maximum muscle and power development',
      start_date: '2025-10-01',
      end_date: '2025-11-26',
      current_week: 1,
      total_weeks: 8,
      status: 'active'
    }
    
    await sql`
      INSERT INTO programs (
        id, name, subtitle, description, start_date, end_date, 
        current_week, total_weeks, status
      ) VALUES (
        ${newProgram.id},
        ${newProgram.name},
        ${newProgram.subtitle},
        ${newProgram.description},
        ${newProgram.start_date},
        ${newProgram.end_date},
        ${newProgram.current_week},
        ${newProgram.total_weeks},
        ${newProgram.status}
      )
    `
    
    console.log("✅ New program added successfully!")
    
    // Add phases for the new program
    const newPhases = [
      {
        id: 'base-strength-' + Date.now(),
        program_id: newProgram.id,
        name: 'Base Strength',
        focus: 'Establish proper lifting technique and build initial strength foundation.',
        weeks: 3,
        start_week: 1,
        end_week: 3,
        status: 'current',
        phase_order: 1
      },
      {
        id: 'intermediate-strength-' + Date.now() + 1,
        program_id: newProgram.id,
        name: 'Intermediate Strength',
        focus: 'Progressive overload with increased volume and complexity.',
        weeks: 3,
        start_week: 4,
        end_week: 6,
        status: 'upcoming',
        phase_order: 2
      },
      {
        id: 'advanced-strength-' + Date.now() + 2,
        program_id: newProgram.id,
        name: 'Advanced Strength',
        focus: 'Peak strength development with advanced techniques and periodization.',
        weeks: 2,
        start_week: 7,
        end_week: 8,
        status: 'upcoming',
        phase_order: 3
      }
    ]
    
    for (const phase of newPhases) {
      await sql`
        INSERT INTO program_phases (
          id, program_id, name, focus, weeks, start_week, end_week, status, phase_order
        ) VALUES (
          ${phase.id},
          ${phase.program_id},
          ${phase.name},
          ${phase.focus},
          ${phase.weeks},
          ${phase.start_week},
          ${phase.end_week},
          ${phase.status},
          ${phase.phase_order}
        )
      `
      console.log(`✅ Added phase: ${phase.name}`)
    }
    
    // Final count
    const programCount = await sql`SELECT COUNT(*) as count FROM programs`
    console.log(`\n🎯 Total programs now: ${programCount[0].count}`)
    
  } catch (error) {
    console.error("❌ Error:", error.message)
  } finally {
    process.exit(0)
  }
}

addNewProgram()
