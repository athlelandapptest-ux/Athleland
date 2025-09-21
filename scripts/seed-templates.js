import { config } from 'dotenv'
import { createWorkoutTemplate } from "../app/actions.js"

// Load environment variables from .env.local
config({ path: '.env.local' })

async function seedTemplates() {
  console.log("🌱 Seeding workout templates...")
  
  const sampleTemplates = [
    {
      title: "HIIT Cardio Blast",
      description: "High-intensity interval training for maximum calorie burn and cardiovascular improvement",
      rounds: [
        {
          name: "Block 1 - Warm Up",
          exercises: [
            { name: "Jumping Jacks", value: 30, unit: "seconds", equipment: "Body Weight" },
            { name: "High Knees", value: 30, unit: "seconds", equipment: "Body Weight" },
          ],
          rounds: 1,
        },
        {
          name: "Block 2 - HIIT Circuit",
          exercises: [
            { name: "Burpees", value: 10, unit: "reps", equipment: "Body Weight" },
            { name: "Mountain Climbers", value: 20, unit: "reps", equipment: "Body Weight" },
            { name: "Jump Squats", value: 15, unit: "reps", equipment: "Body Weight" },
          ],
          rounds: 4,
        },
      ],
      hyroxPrepTypes: ["Sprint Conditioning"],
      hyroxReasoning: "This high-intensity circuit builds explosive power and cardiovascular endurance essential for competitive fitness.",
      otherHyroxPrepNotes: "Focus on maintaining form even when fatigued.",
    },
    {
      title: "Strength Foundation",
      description: "Build muscle and increase strength with compound movements",
      rounds: [
        {
          name: "Block 1 - Compound Movements",
          exercises: [
            { name: "Squats", value: 10, unit: "reps", equipment: "Barbell", isWeightBased: true, weight: "bodyweight" },
            { name: "Deadlifts", value: 8, unit: "reps", equipment: "Barbell", isWeightBased: true, weight: "moderate" },
            { name: "Push-ups", value: 12, unit: "reps", equipment: "Body Weight" },
          ],
          rounds: 3,
        },
      ],
      hyroxPrepTypes: ["Strength Endurance"],
      hyroxReasoning: "Compound movements build functional strength and power transfer essential for athletic performance.",
      otherHyroxPrepNotes: "Progressive overload is key - increase weight or reps each week.",
    },
    {
      title: "HYROX Simulation",
      description: "Specific preparation for HYROX competition events",
      rounds: [
        {
          name: "Block 1 - Running & Ski Erg",
          exercises: [
            { name: "1km Run", value: 1000, unit: "meters", equipment: "Treadmill" },
            { name: "Ski Erg", value: 1000, unit: "meters", equipment: "Ski Erg Machine" },
          ],
          rounds: 1,
        },
        {
          name: "Block 2 - Sled Push & Pull",
          exercises: [
            { name: "Sled Push", value: 50, unit: "meters", equipment: "Weighted Sled", isWeightBased: true, weight: "102kg" },
            { name: "Sled Pull", value: 50, unit: "meters", equipment: "Weighted Sled", isWeightBased: true, weight: "102kg" },
          ],
          rounds: 1,
        },
      ],
      hyroxPrepTypes: ["Hyrox Preparation"],
      hyroxReasoning: "This workout simulates HYROX race conditions to prepare athletes for competition demands.",
      otherHyroxPrepNotes: "Focus on transition speed between exercises.",
    }
  ]

  for (const template of sampleTemplates) {
    try {
      const result = await createWorkoutTemplate(template)
      if (result.success) {
        console.log(`✅ Created template: ${template.title}`)
      } else {
        console.log(`❌ Failed to create template: ${template.title} - ${result.message}`)
      }
    } catch (error) {
      console.log(`❌ Error creating template: ${template.title}`, error.message)
    }
  }
  
  console.log("🎉 Template seeding completed!")
  process.exit(0)
}

seedTemplates()
