import { config } from 'dotenv'
import { generateClassPreview, fetchAllWorkoutTemplates } from "../app/actions.js"

// Load environment variables from .env.local
config({ path: '.env.local' })

async function testClassPreview() {
  try {
    console.log("🧪 Testing class preview generation...")
    
    // First, get available templates
    console.log("\n📋 Fetching available workout templates...")
    const templates = await fetchAllWorkoutTemplates()
    console.log(`Found ${templates.length} templates:`)
    templates.forEach((template, i) => {
      console.log(`   ${i + 1}. ${template.title} (ID: ${template.id})`)
    })
    
    if (templates.length === 0) {
      console.log("❌ No templates available for testing")
      return
    }
    
    // Test preview generation with first template
    const testTemplate = templates[0]
    console.log(`\n🎯 Testing preview with template: ${testTemplate.title}`)
    
    const previewResult = await generateClassPreview(
      [testTemplate.id], // templateKeys
      "2025-09-02",      // date
      "19:00",           // time
      8,                 // intensity
      60,                // duration
      1,                 // numberOfBlocks
      20,                // maxParticipants
      "Sarah Johnson"    // instructor
    )
    
    if (previewResult.success) {
      console.log("✅ Class preview generated successfully!")
      console.log("📊 Preview data:")
      console.log(`   Title: ${previewResult.data.title}`)
      console.log(`   Description: ${previewResult.data.description}`)
      console.log(`   Date: ${previewResult.data.date} at ${previewResult.data.time}`)
      console.log(`   Instructor: ${previewResult.data.instructor}`)
      console.log(`   Intensity: ${previewResult.data.intensity}/15`)
      console.log(`   Workout Breakdown: ${previewResult.data.workoutBreakdown?.length || 0} sections`)
    } else {
      console.log("❌ Preview generation failed:", previewResult.message)
    }
    
  } catch (error) {
    console.error("❌ Error testing class preview:", error.message)
  } finally {
    process.exit(0)
  }
}

testClassPreview()
