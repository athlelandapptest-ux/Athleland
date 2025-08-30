import { config } from 'dotenv'
import { getNeonSql } from "../lib/database.js"

// Load environment variables from .env.local
config({ path: '.env.local' })

async function setupProgramTables() {
  const sql = getNeonSql()
  
  try {
    console.log("🔍 Checking if program tables exist...")
    
    // Check if programs table exists
    const programsTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'programs'
      )
    `
    
    console.log(`📊 Programs table exists: ${programsTableExists[0].exists}`)
    
    if (!programsTableExists[0].exists) {
      console.log("\n🔨 Creating programs table...")
      
      await sql`
        CREATE TABLE programs (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          subtitle TEXT,
          description TEXT,
          start_date DATE NOT NULL,
          end_date DATE,
          current_week INTEGER DEFAULT 1,
          total_weeks INTEGER DEFAULT 0,
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      
      console.log("✅ Programs table created successfully!")
    }
    
    // Check if program_phases table exists
    const phasesTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'program_phases'
      )
    `
    
    console.log(`📊 Program phases table exists: ${phasesTableExists[0].exists}`)
    
    if (!phasesTableExists[0].exists) {
      console.log("\n🔨 Creating program_phases table...")
      
      await sql`
        CREATE TABLE program_phases (
          id VARCHAR(255) PRIMARY KEY,
          program_id VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          focus TEXT,
          weeks INTEGER NOT NULL,
          start_week INTEGER NOT NULL,
          end_week INTEGER NOT NULL,
          status VARCHAR(50) DEFAULT 'upcoming',
          phase_order INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
        )
      `
      
      console.log("✅ Program phases table created successfully!")
    }
    
    // Check current data
    const programCount = await sql`SELECT COUNT(*) as count FROM programs`
    const phaseCount = await sql`SELECT COUNT(*) as count FROM program_phases`
    
    console.log(`📊 Current programs in database: ${programCount[0].count}`)
    console.log(`📊 Current phases in database: ${phaseCount[0].count}`)
    
    if (programCount[0].count === 0) {
      console.log("\n🧪 Adding sample program...")
      
      const sampleProgram = {
        id: 'hyrox-prep-program-' + Date.now(),
        name: 'HYROX Competition Prep',
        subtitle: '12-Week Comprehensive Training Program',
        description: 'Complete training program designed to prepare athletes for HYROX competition',
        start_date: '2025-09-01',
        end_date: '2025-11-24',
        current_week: 1,
        total_weeks: 12,
        status: 'active'
      }
      
      await sql`
        INSERT INTO programs (
          id, name, subtitle, description, start_date, end_date, 
          current_week, total_weeks, status
        ) VALUES (
          ${sampleProgram.id},
          ${sampleProgram.name},
          ${sampleProgram.subtitle},
          ${sampleProgram.description},
          ${sampleProgram.start_date},
          ${sampleProgram.end_date},
          ${sampleProgram.current_week},
          ${sampleProgram.total_weeks},
          ${sampleProgram.status}
        )
      `
      
      console.log("✅ Sample program added successfully!")
      
      // Add sample phases
      const samplePhases = [
        {
          id: 'foundation-phase-' + Date.now(),
          program_id: sampleProgram.id,
          name: 'Foundation Phase',
          focus: 'Building base fitness and movement quality. Focus on proper form and establishing training routine.',
          weeks: 4,
          start_week: 1,
          end_week: 4,
          status: 'current',
          phase_order: 1
        },
        {
          id: 'strength-phase-' + Date.now(),
          program_id: sampleProgram.id,
          name: 'Strength Development',
          focus: 'Progressive strength building with HYROX-specific movements. Increase load and complexity.',
          weeks: 4,
          start_week: 5,
          end_week: 8,
          status: 'upcoming',
          phase_order: 2
        },
        {
          id: 'competition-phase-' + Date.now(),
          program_id: sampleProgram.id,
          name: 'Competition Prep',
          focus: 'Peak performance preparation with race simulation and tapering strategies.',
          weeks: 4,
          start_week: 9,
          end_week: 12,
          status: 'upcoming',
          phase_order: 3
        }
      ]
      
      for (const phase of samplePhases) {
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
    }
    
    // Final verification
    const finalProgramCount = await sql`SELECT COUNT(*) as count FROM programs`
    const finalPhaseCount = await sql`SELECT COUNT(*) as count FROM program_phases`
    
    console.log(`\n🎯 Total programs in database: ${finalProgramCount[0].count}`)
    console.log(`🎯 Total phases in database: ${finalPhaseCount[0].count}`)
    
    // List all programs
    const allPrograms = await sql`
      SELECT id, name, subtitle, start_date, current_week, total_weeks, status 
      FROM programs 
      ORDER BY created_at ASC
    `
    
    console.log("\n📋 All programs:")
    allPrograms.forEach((prog, i) => {
      console.log(`   ${i + 1}. ${prog.name} - Week ${prog.current_week}/${prog.total_weeks} (${prog.status})`)
      console.log(`      ${prog.subtitle}`)
    })
    
  } catch (error) {
    console.error("❌ Error:", error.message)
  } finally {
    process.exit(0)
  }
}

setupProgramTables()
