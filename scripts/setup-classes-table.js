import { config } from 'dotenv'
import { getNeonSql } from "../lib/database.js"

// Load environment variables from .env.local
config({ path: '.env.local' })

async function setupClassesTable() {
  const sql = getNeonSql()
  
  try {
    console.log("🔍 Checking if classes table exists...")
    
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'classes'
      )
    `
    
    console.log(`📊 Classes table exists: ${tableExists[0].exists}`)
    
    if (!tableExists[0].exists) {
      console.log("\n🔨 Creating classes table...")
      
      await sql`
        CREATE TABLE classes (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          routine JSONB,
          instructor VARCHAR(255) NOT NULL,
          date VARCHAR(10) NOT NULL,
          time VARCHAR(5) NOT NULL,
          duration INTEGER DEFAULT 60,
          intensity INTEGER DEFAULT 8,
          status VARCHAR(50) DEFAULT 'approved',
          maxParticipants INTEGER DEFAULT 20,
          workoutBreakdown JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      
      console.log("✅ Classes table created successfully!")
    }
    
    // Check current classes
    const classCount = await sql`SELECT COUNT(*) as count FROM classes`
    console.log(`📊 Current classes in database: ${classCount[0].count}`)
    
    if (classCount[0].count === 0) {
      console.log("\n🧪 Adding sample class...")
      
      const sampleClass = {
        id: 'sample-class-' + Date.now(),
        title: 'HYROX Strength Training',
        description: 'High-intensity functional strength training session',
        routine: JSON.stringify({
          title: 'HYROX Strength Circuit',
          description: 'Functional strength training'
        }),
        instructor: 'Sarah Johnson',
        date: '2025-09-01',
        time: '18:00',
        duration: 60,
        intensity: 9,
        status: 'approved',
        maxParticipants: 20,
        workoutBreakdown: JSON.stringify([
          {
            title: 'Warm-up',
            exercises: [
              { name: 'Dynamic Stretching', duration: 5, unit: 'minutes' }
            ]
          },
          {
            title: 'Main Circuit',
            exercises: [
              { name: 'Burpee Box Jump-Overs', reps: 20, unit: 'reps' },
              { name: 'Rowing', duration: 500, unit: 'meters' },
              { name: 'Kettlebell Swings', reps: 30, unit: 'reps' }
            ]
          }
        ])
      }
      
      await sql`
        INSERT INTO classes (
          id, title, description, routine, instructor, date, time, 
          duration, intensity, status, maxParticipants, workoutBreakdown
        ) VALUES (
          ${sampleClass.id},
          ${sampleClass.title},
          ${sampleClass.description},
          ${sampleClass.routine}::jsonb,
          ${sampleClass.instructor},
          ${sampleClass.date},
          ${sampleClass.time},
          ${sampleClass.duration},
          ${sampleClass.intensity},
          ${sampleClass.status},
          ${sampleClass.maxParticipants},
          ${sampleClass.workoutBreakdown}::jsonb
        )
      `
      
      console.log("✅ Sample class added successfully!")
    }
    
    // Final verification
    const finalCount = await sql`SELECT COUNT(*) as count FROM classes`
    console.log(`🎯 Total classes in database: ${finalCount[0].count}`)
    
  } catch (error) {
    console.error("❌ Error:", error.message)
  } finally {
    process.exit(0)
  }
}

setupClassesTable()
