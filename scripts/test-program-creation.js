import { config } from 'dotenv'
import { createProgramNeon } from "../lib/neon-actions.js"

// Load environment variables from .env.local
config({ path: '.env.local' })

async function testProgramCreation() {
  try {
    console.log("🧪 Testing program creation...")
    
    const testProgramData = {
      name: "Test Endurance Program",
      subtitle: "6-Week Cardio Focused Training",
      startDate: "2025-11-01",
      phases: [
        {
          name: "Aerobic Base",
          weeks: 2,
          focus: "Building aerobic capacity with steady-state cardio"
        },
        {
          name: "Threshold Development",
          weeks: 2,
          focus: "Improving lactate threshold and sustainable pace"
        },
        {
          name: "Peak Performance",
          weeks: 2,
          focus: "High-intensity intervals and race preparation"
        }
      ]
    }
    
    console.log("📋 Creating program with data:")
    console.log(`   Name: ${testProgramData.name}`)
    console.log(`   Subtitle: ${testProgramData.subtitle}`)
    console.log(`   Start Date: ${testProgramData.startDate}`)
    console.log(`   Phases: ${testProgramData.phases.length}`)
    
    const result = await createProgramNeon(testProgramData)
    
    if (result.success) {
      console.log("✅ Program created successfully!")
      console.log(`   Program ID: ${result.data.id}`)
      console.log(`   Total Weeks: ${result.data.totalWeeks}`)
      console.log(`   Phases Created: ${result.data.phases.length}`)
      
      console.log("\n📊 Created phases:")
      result.data.phases.forEach((phase, i) => {
        console.log(`   ${i + 1}. ${phase.name} (Weeks ${phase.startWeek}-${phase.endWeek}) - ${phase.status}`)
      })
    } else {
      console.log("❌ Program creation failed:", result.message)
    }
    
  } catch (error) {
    console.error("❌ Error testing program creation:", error.message)
  } finally {
    process.exit(0)
  }
}

testProgramCreation()
