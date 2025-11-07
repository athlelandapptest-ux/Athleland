type Exercise = {
  name?: string;
  reps?: number;
  unit?: string;
  weight?: number | string;
  distance?: number | null;
  duration?: number | null;
  [k: string]: any;
};

type Round = {
  title?: string;
  exercises?: Exercise[];
  [k: string]: any;
};

export function normalizeWorkoutBreakdown(rounds: any): Round[] {
  if (!Array.isArray(rounds)) return [];

  return rounds.map((round) => {
    const exercises = Array.isArray(round?.exercises) ? round.exercises : [];
    const fixed = exercises.map((ex: Exercise) => {
      const unit = (ex.unit || "").toString().toLowerCase().trim();
      const isMeters = unit === "m" || unit === "meter" || unit === "meters";
      const distance =
        ex.distance == null && isMeters ? 100 : ex.distance ?? null;
      return { ...ex, unit, distance };
    });
    return { ...round, exercises: fixed };
  });
}
