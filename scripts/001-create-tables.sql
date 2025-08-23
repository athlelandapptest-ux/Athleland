-- ATHLELAND Database Schema
-- Create all necessary tables for the fitness club management system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    full_description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INTEGER DEFAULT 60,
    location VARCHAR(255) DEFAULT 'ATHLELAND Main Facility',
    category VARCHAR(50) DEFAULT 'workshop',
    max_participants INTEGER DEFAULT 20,
    current_participants INTEGER DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0,
    instructor VARCHAR(255),
    difficulty VARCHAR(50) DEFAULT 'Intermediate',
    image VARCHAR(500),
    gallery TEXT[], -- Array of image URLs
    tags TEXT[], -- Array of tags
    featured BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'draft',
    requirements TEXT[], -- Array of requirements
    what_to_bring TEXT[], -- Array of items to bring
    is_sponsored BOOLEAN DEFAULT false,
    sponsor_id VARCHAR(255),
    registration_deadline DATE,
    allow_waitlist BOOLEAN DEFAULT true,
    member_discount DECIMAL(5,2) DEFAULT 0,
    cancellation_policy JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
    id VARCHAR(255) PRIMARY KEY,
    event_id VARCHAR(255) REFERENCES events(id) ON DELETE CASCADE,
    participant_name VARCHAR(255) NOT NULL,
    participant_email VARCHAR(255) NOT NULL,
    participant_phone VARCHAR(50),
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(50),
    dietary_restrictions TEXT,
    medical_conditions TEXT,
    fitness_level VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event sponsors table
CREATE TABLE IF NOT EXISTS event_sponsors (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo VARCHAR(500),
    website VARCHAR(500),
    tier VARCHAR(50) DEFAULT 'bronze',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sponsorship packages table
CREATE TABLE IF NOT EXISTS sponsorship_packages (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration VARCHAR(100) DEFAULT 'per year',
    features TEXT[] NOT NULL,
    highlighted BOOLEAN DEFAULT false,
    available BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sponsorship inquiries table
CREATE TABLE IF NOT EXISTS sponsorship_inquiries (
    id VARCHAR(255) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    package_id VARCHAR(255) REFERENCES sponsorship_packages(id),
    package_interest VARCHAR(255),
    industry VARCHAR(255),
    message TEXT,
    newsletter BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training programs table
CREATE TABLE IF NOT EXISTS programs (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    start_date DATE NOT NULL,
    current_week INTEGER DEFAULT 1,
    total_weeks INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT false,
    phases JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workout routines table
CREATE TABLE IF NOT EXISTS workout_routines (
    id VARCHAR(255) PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    rounds JSONB NOT NULL,
    hyrox_prep_types TEXT[],
    hyrox_reasoning TEXT,
    other_hyrox_prep_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workout classes table
CREATE TABLE IF NOT EXISTS workout_classes (
    id VARCHAR(255) PRIMARY KEY,
    class_number INTEGER,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INTEGER DEFAULT 60,
    numerical_intensity INTEGER DEFAULT 5,
    number_of_blocks INTEGER DEFAULT 1,
    max_participants INTEGER DEFAULT 20,
    instructor VARCHAR(255),
    routine_key VARCHAR(255) REFERENCES workout_routines(key),
    routine_keys TEXT[], -- For multi-routine classes
    class_focus VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON event_registrations(participant_email);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);
CREATE INDEX IF NOT EXISTS idx_sponsorship_inquiries_status ON sponsorship_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_programs_active ON programs(is_active);
CREATE INDEX IF NOT EXISTS idx_workout_classes_date ON workout_classes(date);
CREATE INDEX IF NOT EXISTS idx_workout_classes_status ON workout_classes(status);

-- Add foreign key constraint for sponsor relationship
ALTER TABLE events ADD CONSTRAINT fk_events_sponsor 
    FOREIGN KEY (sponsor_id) REFERENCES event_sponsors(id) ON DELETE SET NULL;

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_registrations_updated_at BEFORE UPDATE ON event_registrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_sponsors_updated_at BEFORE UPDATE ON event_sponsors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsorship_packages_updated_at BEFORE UPDATE ON sponsorship_packages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsorship_inquiries_updated_at BEFORE UPDATE ON sponsorship_inquiries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_routines_updated_at BEFORE UPDATE ON workout_routines 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_classes_updated_at BEFORE UPDATE ON workout_classes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
