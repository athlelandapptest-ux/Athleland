-- Add workout templates table
-- This migration adds a dedicated table for workout templates

-- Workout templates table
CREATE TABLE IF NOT EXISTS workout_templates (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    rounds JSONB NOT NULL,
    hyrox_prep_types TEXT[],
    hyrox_reasoning TEXT,
    other_hyrox_prep_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_workout_templates_title ON workout_templates(title);
CREATE INDEX IF NOT EXISTS idx_workout_templates_created_at ON workout_templates(created_at);

-- Create trigger for updated_at column
CREATE TRIGGER update_workout_templates_updated_at BEFORE UPDATE ON workout_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
