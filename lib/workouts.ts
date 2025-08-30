export interface Exercise {
  name: string
  value: number
  unit: string
  equipment?: string
  isWeightBased?: boolean
  weight?: string
  rounds?: number
  laps?: number
  distance?: number
  distanceUnit?: "meters" | "km"
}

export interface Round {
  name: string
  exercises: Exercise[]
  rounds?: number
  roundsPerBlock?: number
}

export interface Routine {
  title?: string
  rounds: Round[]
  exercises?: Exercise[]
}

export interface WorkoutClass {
  id: string
  name: string
  title?: string
  description: string
  date: string
  time: string
  duration: number
  intensity: number
  numericalIntensity?: number
  classNumber: string
  classFocus: string
  numberOfBlocks: number
  routine: Routine
  routines?: Routine[]
  difficulty: string
  maxParticipants: number
  instructor: string
  status?: "draft" | "approved" | "cancelled"
  workoutBreakdown?: Array<{
    title: string
    exercises: Array<{
      name: string
      reps: number
      unit: string
      weight?: string
    }>
  }>
}

export interface ProgramPhase {
  id: string
  name: string
  weeks: number
  focus: string
  order: number
  status: "upcoming" | "current" | "completed"
  startWeek: number
  endWeek: number
}

export interface TrainingProgram {
  id: string
  name: string
  subtitle: string
  startDate: string
  currentWeek: number
  totalWeeks: number
  phases: ProgramPhase[]
  isActive?: boolean
  updatedAt?: string
}

export function getIntensityLabel(intensity: number): string {
  if (intensity <= 5) return "Low"
  if (intensity <= 10) return "Moderate"
  return "High"
}

export const equipmentSuggestions: Record<string, string[]> = {
  // Cardio Equipment
  run: ["Treadmill", "Track", "Outdoor"],
  bike: ["Assault Bike", "Stationary Bike", "Road Bike"],
  row: ["Rowing Machine", "Concept2 Rower"],
  ski: ["Ski Erg Machine"],
  swim: ["Pool", "Open Water"],

  // Strength Equipment
  squat: ["Barbell", "Dumbbell", "Kettlebell", "Body Weight"],
  deadlift: ["Barbell", "Dumbbell", "Trap Bar"],
  press: ["Barbell", "Dumbbell", "Kettlebell"],
  pull: ["Pull-up Bar", "Resistance Band", "Cable Machine"],
  push: ["Body Weight", "Push-up Bars"],

  // Functional Equipment
  carry: ["Kettlebell", "Dumbbell", "Farmer's Walk Handles"],
  sled: ["Weighted Sled", "Prowler"],
  rope: ["Battle Ropes", "Climbing Rope"],
  box: ["Plyo Box", "Step Platform"],
  ball: ["Medicine Ball", "Slam Ball", "Wall Ball"],

  // Body Weight
  burpee: ["Body Weight"],
  jump: ["Body Weight", "Plyo Box"],
  plank: ["Body Weight", "Ab Mat"],
  lunge: ["Body Weight", "Dumbbell", "Barbell"],
}

export function detectEquipment(exerciseName: string): string[] {
  const name = exerciseName.toLowerCase()
  const suggestions: string[] = []

  for (const [keyword, equipment] of Object.entries(equipmentSuggestions)) {
    if (name.includes(keyword)) {
      suggestions.push(...equipment)
    }
  }

  return suggestions.length > 0 ? [...new Set(suggestions)] : ["Body Weight"]
}

// Sample workout classes data
export const sampleClasses: WorkoutClass[] = [
  {
    id: "class-001",
    name: "HYROX Prep Session",
    title: "HYROX Prep Session",
    description: "High-intensity functional fitness training designed to prepare athletes for HYROX competitions",
    date: "2025-01-30",
    time: "6:00 AM",
    duration: 60,
    intensity: 12,
    numericalIntensity: 12,
    classNumber: "001",
    classFocus: "Functional Fitness",
    numberOfBlocks: 4,
    difficulty: "Advanced",
    maxParticipants: 16,
    instructor: "Coach Sarah",
    status: "approved",
    routine: {
      title: "HYROX Simulation",
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
            {
              name: "Sled Push",
              value: 50,
              unit: "meters",
              equipment: "Weighted Sled",
              isWeightBased: true,
              weight: "102kg",
            },
            {
              name: "Sled Pull",
              value: 50,
              unit: "meters",
              equipment: "Weighted Sled",
              isWeightBased: true,
              weight: "102kg",
            },
          ],
          rounds: 1,
        },
        {
          name: "Block 3 - Burpee Broad Jumps",
          exercises: [{ name: "Burpee Broad Jumps", value: 80, unit: "meters", equipment: "Body Weight" }],
          rounds: 1,
        },
        {
          name: "Block 4 - Rowing & Farmers Carry",
          exercises: [
            { name: "Rowing", value: 1000, unit: "meters", equipment: "Rowing Machine" },
            {
              name: "Farmers Carry",
              value: 200,
              unit: "meters",
              equipment: "Kettlebells",
              isWeightBased: true,
              weight: "2x24kg",
            },
          ],
          rounds: 1,
        },
      ],
    },
  },
  {
    id: "class-002",
    name: "Strength & Conditioning",
    title: "Strength & Conditioning",
    description: "Build raw strength and power through compound movements and conditioning circuits",
    date: "2025-01-30",
    time: "7:30 AM",
    duration: 75,
    intensity: 10,
    numericalIntensity: 10,
    classNumber: "002",
    classFocus: "Strength Training",
    numberOfBlocks: 3,
    difficulty: "Intermediate",
    maxParticipants: 12,
    instructor: "Coach Mike",
    status: "approved",
    routine: {
      title: "Power Development",
      rounds: [
        {
          name: "Block 1 - Compound Strength",
          exercises: [
            {
              name: "Back Squat",
              value: 5,
              unit: "reps",
              equipment: "Barbell",
              isWeightBased: true,
              weight: "80-90% 1RM",
            },
            {
              name: "Deadlift",
              value: 5,
              unit: "reps",
              equipment: "Barbell",
              isWeightBased: true,
              weight: "80-90% 1RM",
            },
            {
              name: "Bench Press",
              value: 5,
              unit: "reps",
              equipment: "Barbell",
              isWeightBased: true,
              weight: "80-90% 1RM",
            },
          ],
          rounds: 4,
        },
        {
          name: "Block 2 - Power Development",
          exercises: [
            { name: "Box Jumps", value: 10, unit: "reps", equipment: "Plyo Box" },
            {
              name: "Medicine Ball Slams",
              value: 15,
              unit: "reps",
              equipment: "Medicine Ball",
              isWeightBased: true,
              weight: "20kg",
            },
            {
              name: "Kettlebell Swings",
              value: 20,
              unit: "reps",
              equipment: "Kettlebell",
              isWeightBased: true,
              weight: "24kg",
            },
          ],
          rounds: 3,
        },
        {
          name: "Block 3 - Conditioning Finisher",
          exercises: [
            { name: "Burpees", value: 10, unit: "reps", equipment: "Body Weight" },
            { name: "Mountain Climbers", value: 20, unit: "reps", equipment: "Body Weight" },
            { name: "Jump Squats", value: 15, unit: "reps", equipment: "Body Weight" },
          ],
          rounds: 3,
        },
      ],
    },
  },
  {
    id: "class-003",
    name: "Metabolic Conditioning",
    title: "Metabolic Conditioning",
    description: "High-intensity metabolic training to improve cardiovascular capacity and fat burning",
    date: "2025-01-31",
    time: "6:00 AM",
    duration: 45,
    intensity: 14,
    numericalIntensity: 14,
    classNumber: "003",
    classFocus: "Cardio & Conditioning",
    numberOfBlocks: 5,
    difficulty: "Advanced",
    maxParticipants: 20,
    instructor: "Coach Lisa",
    status: "approved",
    routine: {
      title: "MetCon Blast",
      rounds: [
        {
          name: "Block 1 - Bike Sprint",
          exercises: [
            { name: "Assault Bike", value: 30, unit: "seconds", equipment: "Assault Bike" },
            { name: "Rest", value: 30, unit: "seconds", equipment: "None" },
          ],
          rounds: 8,
        },
        {
          name: "Block 2 - Rowing Intervals",
          exercises: [
            { name: "Rowing", value: 250, unit: "meters", equipment: "Rowing Machine" },
            { name: "Rest", value: 60, unit: "seconds", equipment: "None" },
          ],
          rounds: 6,
        },
        {
          name: "Block 3 - Battle Ropes",
          exercises: [
            { name: "Battle Ropes", value: 20, unit: "seconds", equipment: "Battle Ropes" },
            { name: "Rest", value: 40, unit: "seconds", equipment: "None" },
          ],
          rounds: 5,
        },
        {
          name: "Block 4 - Bodyweight Circuit",
          exercises: [
            { name: "Burpees", value: 5, unit: "reps", equipment: "Body Weight" },
            { name: "Jump Squats", value: 10, unit: "reps", equipment: "Body Weight" },
            { name: "Push-ups", value: 15, unit: "reps", equipment: "Body Weight" },
          ],
          rounds: 4,
        },
        {
          name: "Block 5 - Finisher",
          exercises: [
            { name: "Plank Hold", value: 60, unit: "seconds", equipment: "Body Weight" },
            { name: "Wall Sit", value: 60, unit: "seconds", equipment: "Body Weight" },
          ],
          rounds: 2,
        },
      ],
    },
  },
]

// Add these missing functions that are referenced in actions.ts

export function adjustRoutineForIntensity(routine: Routine, intensity: number): Routine {
  // Create a copy of the routine to avoid mutating the original
  const adjustedRoutine = JSON.parse(JSON.stringify(routine))

  // Adjust exercise values based on intensity level
  adjustedRoutine.rounds = adjustedRoutine.rounds.map((round: Round) => ({
    ...round,
    exercises: round.exercises.map((exercise: Exercise) => {
      let adjustedValue = exercise.value

      // Adjust based on intensity level (1-15 scale)
      if (intensity <= 5) {
        // Low intensity: reduce by 20%
        adjustedValue = Math.round(exercise.value * 0.8)
      } else if (intensity >= 12) {
        // High intensity: increase by 20%
        adjustedValue = Math.round(exercise.value * 1.2)
      }
      // Medium intensity (6-11): keep original values

      return {
        ...exercise,
        value: Math.max(1, adjustedValue), // Ensure minimum value of 1
      }
    }),
  }))

  return adjustedRoutine
}

export function getPrimaryClassFocus(routines: Routine[]): string {
  // Extract all focus types from all routines
  const allFocusTypes = routines.flatMap((routine) => routine.title || "General Fitness")

  // For now, return a simple focus based on routine titles
  if (routines.length === 1) {
    return routines[0].title || "General Fitness"
  }

  // Multiple routines - return combined focus
  return "Multi-Routine Training"
}

// Add missing interfaces and types
export interface WorkoutRoutine {
  key: string
  title: string
  description: string
  rounds: Round[]
  hyroxPrepTypes?: string[]
  hyroxReasoning?: string
  otherHyroxPrepNotes?: string
}

export interface WorkoutTemplate extends Omit<WorkoutRoutine, "key"> {
  id: string
  createdAt: string
  updatedAt: string
}

// In-memory data storage
export const inMemoryRoutines: WorkoutRoutine[] = []
export const inMemoryWorkoutTemplates: WorkoutTemplate[] = [
  {
    id: "template-001",
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "template-002", 
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]
export const inMemoryClasses: WorkoutClass[] = []
export const inMemoryPrograms: TrainingProgram[] = [
  {
    id: "program-001",
    name: "HYROX Preparation Program",
    subtitle: "12-week structured training for competitive fitness",
    startDate: "2025-01-01",
    currentWeek: 8,
    totalWeeks: 12,
    isActive: true,
    phases: [
      {
        id: "phase-1",
        name: "Foundation Phase",
        weeks: 4,
        focus: "Building base fitness and movement patterns essential for athletic development",
        order: 1,
        startWeek: 1,
        endWeek: 4,
        status: "completed",
      },
      {
        id: "phase-2",
        name: "Strength Phase",
        weeks: 4,
        focus: "Developing maximal strength and power through progressive overload",
        order: 2,
        startWeek: 5,
        endWeek: 8,
        status: "current",
      },
      {
        id: "phase-3",
        name: "Competition Phase",
        weeks: 4,
        focus: "Sport-specific training and peak performance preparation",
        order: 3,
        startWeek: 9,
        endWeek: 12,
        status: "upcoming",
      },
    ],
  },
]
