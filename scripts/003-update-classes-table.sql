-- Migration script to update workout_classes table for full class support

-- Add missing columns to workout_classes table
ALTER TABLE workout_classes 
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS intensity INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS class_focus VARCHAR(255),
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50) DEFAULT 'Intermediate',
ADD COLUMN IF NOT EXISTS routine JSONB,
ADD COLUMN IF NOT EXISTS routines JSONB,
ADD COLUMN IF NOT EXISTS workout_breakdown JSONB;

-- Update the table to handle the new data structure better
-- Make sure we can store the full routine and workout breakdown data
ALTER TABLE workout_classes 
ALTER COLUMN routine_key DROP NOT NULL,
ALTER COLUMN routine_keys DROP NOT NULL;

-- Add index for better performance on class searches
CREATE INDEX IF NOT EXISTS idx_workout_classes_title ON workout_classes(title);
CREATE INDEX IF NOT EXISTS idx_workout_classes_class_focus ON workout_classes(class_focus);
CREATE INDEX IF NOT EXISTS idx_workout_classes_difficulty ON workout_classes(difficulty);

-- Update the constraint to allow NULL values for routine_key since we're now storing the full routine
ALTER TABLE workout_classes DROP CONSTRAINT IF EXISTS workout_classes_routine_key_fkey;
