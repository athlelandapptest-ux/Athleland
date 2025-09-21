import { config } from 'dotenv'
import { getNeonSql } from "../lib/database.js"

// Load environment variables from .env.local
config({ path: '.env.local' })

async function addSampleClass() {
  const sql = getNeonSql()
  
  try {
    console.log("🧪 Adding sample class for testing...")
    
    const sampleClass = {
      id: 'sample-class-' + Date.now(),
      title: 'HYROX Strength Training',
      description: 'High-intensity functional strength training session designed for HYROX preparation',
      routine: JSON.stringify({
        title: 'HYROX Strength Circuit',
        description: 'Functional strength training using HYROX movements'
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
          title: 'Warm-up (10 min)',
          exercises: [
            { name: 'Dynamic Stretching', duration: 5, unit: 'minutes' },
            { name: 'Light Cardio', duration: 5, unit: 'minutes' }
          ]
        },
        {
          title: 'Main Circuit (40 min)',
          exercises: [
            { name: 'Burpee Box Jump-Overs', reps: 20, unit: 'reps' },
            { name: 'Rowing', duration: 500, unit: 'meters' },
            { name: 'Kettlebell Swings', reps: 30, unit: 'reps', weight: '20kg' },
            { name: 'Ski Erg', duration: 500, unit: 'meters' },
            { name: 'Sled Push', distance: 50, unit: 'meters', weight: 'bodyweight' }
          ]
        },
        {
          title: 'Cool-down (10 min)',
          exercises: [
            { name: 'Static Stretching', duration: 10, unit: 'minutes' }
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
    
    // Verify
    const classCount = await sql`SELECT COUNT(*) as count FROM classes`
    console.log(`🎯 Total classes in database: ${classCount[0].count}`)
    
    // List all classes
    const allClasses = await sql`
      SELECT id, title, instructor, date, time, status 
      FROM classes 
      ORDER BY date ASC, time ASC
    `
    
    console.log("\n📋 All scheduled classes:")
    allClasses.forEach((cls, i) => {
      console.log(`   ${i + 1}. ${cls.title} - ${cls.instructor} on ${cls.date} at ${cls.time} (${cls.status})`)
    })
    
  } catch (error) {
    console.error("❌ Error:", error.message)
  } finally {
    process.exit(0)
  }
}

addSampleClass()
