import { config } from 'dotenv'
import { getCurrentProgram, createProgram } from "../app/actions.js"

// Load environment variables from .env.local
config({ path: '.env.local' })

async function testProgramManagement() {
  try {
    console.log("🧪 Testing program management...")
    
    // Test fetching current program
    console.log("\n📋 Fetching current program...")
    const currentProgram = await getCurrentProgram()
    
    if (currentProgram) {
      console.log("✅ Current program found:")
      console.log(`   Name: ${currentProgram.name}`)
      console.log(`   Subtitle: ${currentProgram.subtitle}`)
      console.log(`   Week: ${currentProgram.currentWeek}/${currentProgram.totalWeeks}`)
      console.log(`   Phases: ${currentProgram.phases?.length || 0}`)
      
      if (currentProgram.phases && currentProgram.phases.length > 0) {
        console.log("\n📊 Program phases:")
        currentProgram.phases.forEach((phase, i) => {
          console.log(`   ${i + 1}. ${phase.name} (Weeks ${phase.startWeek}-${phase.endWeek}) - ${phase.status}`)
          console.log(`      Focus: ${phase.focus}`)
        })
      }
    } else {
      console.log("❌ No current program found")
    }
    
    // Test creating a new program
    console.log("\n🚀 Testing program creation...")
    
    const testProgramData = {
      name: "Test Strength Program",
      subtitle: "6-Week Strength Building Program",
      startDate: "2025-10-01",
      phases: [
        {
          name: "Strength Foundation",
          weeks: 3,
          focus: "Building base strength with compound movements"
        },
        {
          name: "Power Development",
          weeks: 3,
          focus: "Explosive power and advanced strength techniques"
        }
      ]
    }
    
    const createResult = await createProgram(testProgramData)
    
    if (createResult.success) {
      console.log("✅ Test program created successfully!")
      console.log(`   Program ID: ${createResult.data.id}`)
    } else {
      console.log("❌ Program creation failed:", createResult.message)
    }
    
  } catch (error) {
    console.error("❌ Error testing program management:", error.message)
  } finally {
    process.exit(0)
  }
}

testProgramManagement()
