export interface WorkoutClass {
  id: string
  title: string
  description: string
  instructor: string
  duration: number
  intensity: "low" | "medium" | "high"
  createdAt: string
  updatedAt: string
}

export const inMemoryClasses: WorkoutClass[] = []
