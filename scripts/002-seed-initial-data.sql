-- ATHLELAND Database Seed Data
-- Insert sample data for development and testing

-- Clear existing data (be careful in production!)
TRUNCATE TABLE event_registrations CASCADE;
TRUNCATE TABLE events CASCADE;
TRUNCATE TABLE event_sponsors CASCADE;
TRUNCATE TABLE sponsorship_inquiries CASCADE;
TRUNCATE TABLE sponsorship_packages CASCADE;
TRUNCATE TABLE workout_classes CASCADE;
TRUNCATE TABLE workout_routines CASCADE;
TRUNCATE TABLE programs CASCADE;

-- Insert Event Sponsors
INSERT INTO event_sponsors (id, name, logo, website, tier, is_active) VALUES
('sponsor-1', 'ROGUE FITNESS', '/images/sponsors/rogue-logo.png', 'https://www.roguefitness.com', 'platinum', true),
('sponsor-2', 'NOBULL', '/images/sponsors/nobull-logo.png', 'https://www.nobullproject.com', 'gold', true),
('sponsor-3', 'WHOOP', '/images/sponsors/whoop-logo.png', 'https://www.whoop.com', 'gold', true),
('sponsor-4', 'RXBAR', '/images/sponsors/rxbar-logo.png', 'https://www.rxbar.com', 'silver', true),
('sponsor-5', 'CELSIUS', '/images/sponsors/celsius-logo.png', 'https://www.celsius.com', 'bronze', true);

-- Insert Sponsorship Packages
INSERT INTO sponsorship_packages (id, name, price, duration, features, highlighted, available, description) VALUES
('pkg-1', 'Bronze Partner', 2500.00, 'per year', 
 ARRAY['Logo in reception area', 'Social media mentions', 'Member newsletter inclusion', 'Event co-branding opportunities'],
 false, true, 'Perfect for local businesses looking to connect with our fitness community'),
('pkg-2', 'Silver Partner', 5000.00, 'per year',
 ARRAY['Logo in training areas', 'Event co-branding', 'Quarterly member events', 'Website partnership page', 'Social media features'],
 true, true, 'Ideal for growing brands wanting increased visibility and engagement'),
('pkg-3', 'Gold Partner', 10000.00, 'per year',
 ARRAY['Premium logo placement', 'Exclusive member discounts', 'Monthly events', 'Content collaboration', 'Athlete partnerships', 'Product sampling'],
 false, true, 'Premium partnership for established brands seeking maximum exposure'),
('pkg-4', 'Platinum Partner', 20000.00, 'per year',
 ARRAY['Title sponsor opportunities', 'Custom activation spaces', 'VIP member experiences', 'Co-branded merchandise', 'Exclusive events', 'Performance data insights'],
 false, true, 'Ultimate partnership for industry leaders and major brands');

-- Insert Sample Events
INSERT INTO events (id, title, description, full_description, date, time, duration, location, category, max_participants, current_participants, price, instructor, difficulty, image, tags, featured, status, requirements, what_to_bring, is_sponsored, sponsor_id, registration_deadline, allow_waitlist, member_discount, cancellation_policy) VALUES
('event-1', 'HYROX Competition Prep Workshop', 'Master the 8 stations with expert coaching and race strategy', 
 'Join our comprehensive HYROX preparation workshop designed for athletes of all levels. Learn proper technique for all 8 stations, develop race strategy, and train with competition-grade equipment. Our certified coaches will guide you through each movement pattern and help you identify areas for improvement.',
 '2025-02-15', '09:00', 180, 'ATHLELAND Main Facility', 'workshop', 16, 8, 75.00, 'Coach Sarah Mitchell', 'Intermediate',
 '/images/events/hyrox-workshop.jpg', ARRAY['HYROX', 'Competition', 'Strategy', 'Technique'], true, 'published',
 ARRAY['Basic fitness level required', 'Completed at least 3 ATHLELAND classes'], 
 ARRAY['Water bottle', 'Towel', 'Athletic shoes', 'Comfortable workout clothes'],
 true, 'sponsor-1', '2025-02-13', true, 10.00,
 '{"fullRefundHours": 48, "partialRefundHours": 24, "partialRefundPercentage": 50}'),

('event-2', 'Functional Movement Seminar', 'Deep dive into movement quality and injury prevention',
 'This seminar focuses on the fundamental movement patterns that form the foundation of all athletic performance. Learn to assess your own movement quality, identify limitations, and develop corrective strategies. Perfect for athletes, coaches, and fitness enthusiasts.',
 '2025-02-22', '14:00', 120, 'ATHLELAND Main Facility', 'seminar', 20, 12, 45.00, 'Dr. Mike Thompson', 'Beginner',
 '/images/events/movement-seminar.jpg', ARRAY['Movement', 'Mobility', 'Prevention', 'Education'], false, 'published',
 ARRAY['No prerequisites required', 'Open to all fitness levels'],
 ARRAY['Yoga mat', 'Water bottle', 'Notebook for taking notes'],
 false, null, '2025-02-20', true, 15.00,
 '{"fullRefundHours": 24, "partialRefundHours": 12, "partialRefundPercentage": 75}'),

('event-3', 'Nutrition for Performance Workshop', 'Optimize your fueling strategy for peak performance',
 'Learn how to fuel your body for optimal performance and recovery. This workshop covers macro and micronutrient timing, hydration strategies, and supplement protocols. Includes meal planning templates and recipe ideas.',
 '2025-03-01', '11:00', 90, 'ATHLELAND Classroom', 'workshop', 25, 18, 35.00, 'Nutritionist Lisa Chen', 'Beginner',
 '/images/events/nutrition-workshop.jpg', ARRAY['Nutrition', 'Performance', 'Recovery', 'Meal Planning'], false, 'published',
 ARRAY['Interest in improving nutrition knowledge'],
 ARRAY['Notebook', 'Pen', 'Calculator (optional)'],
 true, 'sponsor-4', '2025-02-27', false, 20.00,
 '{"fullRefundHours": 72, "partialRefundHours": 48, "partialRefundPercentage": 60}'),

('event-4', 'Advanced Strength Training Clinic', 'Master complex lifts with personalized coaching',
 'Take your strength training to the next level with this intensive clinic. Focus on advanced techniques for squat, deadlift, and press variations. Small group setting ensures personalized attention and immediate feedback.',
 '2025-03-08', '16:00', 150, 'ATHLELAND Strength Zone', 'training', 8, 6, 95.00, 'Coach Marcus Johnson', 'Advanced',
 '/images/events/strength-clinic.jpg', ARRAY['Strength', 'Powerlifting', 'Technique', 'Advanced'], true, 'published',
 ARRAY['6+ months strength training experience', 'Ability to squat and deadlift bodyweight'],
 ARRAY['Lifting shoes (optional)', 'Wrist wraps', 'Belt (if you use one)', 'Water bottle'],
 true, 'sponsor-2', '2025-03-06', true, 5.00,
 '{"fullRefundHours": 48, "partialRefundHours": 24, "partialRefundPercentage": 50}');

-- Insert Sample Event Registrations
INSERT INTO event_registrations (id, event_id, participant_name, participant_email, participant_phone, emergency_contact, emergency_phone, dietary_restrictions, medical_conditions, fitness_level, status, payment_status) VALUES
('reg-1', 'event-1', 'John Smith', 'john.smith@email.com', '555-0101', 'Jane Smith', '555-0102', 'None', 'None', 'Intermediate', 'confirmed', 'paid'),
('reg-2', 'event-1', 'Emily Johnson', 'emily.j@email.com', '555-0201', 'Mike Johnson', '555-0202', 'Vegetarian', 'None', 'Advanced', 'confirmed', 'paid'),
('reg-3', 'event-2', 'David Wilson', 'david.w@email.com', '555-0301', 'Sarah Wilson', '555-0302', 'Gluten-free', 'Previous knee injury', 'Beginner', 'confirmed', 'paid'),
('reg-4', 'event-3', 'Lisa Brown', 'lisa.brown@email.com', '555-0401', 'Tom Brown', '555-0402', 'None', 'None', 'Intermediate', 'pending', 'pending'),
('reg-5', 'event-4', 'Alex Chen', 'alex.chen@email.com', '555-0501', 'Maria Chen', '555-0502', 'None', 'None', 'Advanced', 'confirmed', 'paid');

-- Insert Sample Sponsorship Inquiries
INSERT INTO sponsorship_inquiries (id, company_name, contact_name, email, phone, package_id, package_interest, industry, message, newsletter, status) VALUES
('inq-1', 'FitTech Solutions', 'Robert Martinez', 'robert@fittech.com', '555-1001', 'pkg-2', 'Silver Partner', 'Technology', 
 'We are interested in partnering with ATHLELAND to showcase our fitness tracking technology to your members.', true, 'pending'),
('inq-2', 'Healthy Eats Co', 'Amanda Foster', 'amanda@healthyeats.com', '555-1002', 'pkg-1', 'Bronze Partner', 'Food & Beverage',
 'Our meal prep service would be a great fit for your health-conscious community.', true, 'contacted'),
('inq-3', 'Elite Sports Gear', 'Kevin Park', 'kevin@elitesports.com', '555-1003', 'pkg-3', 'Gold Partner', 'Retail',
 'We would like to discuss a comprehensive partnership including product placement and member discounts.', false, 'approved');

-- Insert Sample Training Program
INSERT INTO programs (id, name, subtitle, start_date, current_week, total_weeks, is_active, phases) VALUES
('prog-1', 'HYROX PREPARATION PHASE 2', '8-Week Intensive Training Block', '2025-01-06', 3, 8, true,
 '[
   {
     "id": "phase-1",
     "name": "Base Building",
     "weeks": 3,
     "focus": "Aerobic capacity and movement quality",
     "order": 1,
     "status": "completed",
     "startWeek": 1,
     "endWeek": 3
   },
   {
     "id": "phase-2", 
     "name": "Strength Development",
     "weeks": 3,
     "focus": "Functional strength and power",
     "order": 2,
     "status": "current",
     "startWeek": 4,
     "endWeek": 6
   },
   {
     "id": "phase-3",
     "name": "Competition Prep",
     "weeks": 2,
     "focus": "Race simulation and tapering",
     "order": 3,
     "status": "upcoming",
     "startWeek": 7,
     "endWeek": 8
   }
 ]');

-- Insert Sample Workout Routines
INSERT INTO workout_routines (id, key, title, description, rounds, hyrox_prep_types, hyrox_reasoning, other_hyrox_prep_notes) VALUES
('routine-1', 'hyrox-station-focus', 'HYROX Station Focus', 'Targeted training for specific HYROX stations',
 '[
   {
     "name": "Warm-up",
     "exercises": [
       {"name": "Dynamic Stretching", "duration": "5 minutes", "reps": "", "weight": "", "rest": ""},
       {"name": "Light Rowing", "duration": "3 minutes", "reps": "", "weight": "", "rest": ""}
     ]
   },
   {
     "name": "Main Block",
     "exercises": [
       {"name": "SkiErg", "duration": "1000m", "reps": "", "weight": "", "rest": "2 min"},
       {"name": "Sled Push", "duration": "", "reps": "50m", "weight": "102kg", "rest": "2 min"},
       {"name": "Sled Pull", "duration": "", "reps": "50m", "weight": "78kg", "rest": "2 min"},
       {"name": "Burpee Broad Jumps", "duration": "", "reps": "80", "weight": "", "rest": "3 min"}
     ]
   }
 ]',
 ARRAY['Hyrox Preparation', 'Station Practice'], 
 'This routine focuses on the specific movement patterns and energy systems used in HYROX competition.',
 'Practice transitions between stations to improve race efficiency.'),

('routine-2', 'functional-strength', 'Functional Strength Circuit', 'Build strength through functional movement patterns',
 '[
   {
     "name": "Activation",
     "exercises": [
       {"name": "Band Pull-aparts", "duration": "", "reps": "15", "weight": "", "rest": "30s"},
       {"name": "Bodyweight Squats", "duration": "", "reps": "20", "weight": "", "rest": "30s"}
     ]
   },
   {
     "name": "Strength Circuit",
     "exercises": [
       {"name": "Goblet Squats", "duration": "", "reps": "12", "weight": "24kg", "rest": "60s"},
       {"name": "Push-ups", "duration": "", "reps": "10-15", "weight": "", "rest": "60s"},
       {"name": "Single-arm Rows", "duration": "", "reps": "10 each", "weight": "20kg", "rest": "60s"},
       {"name": "Plank Hold", "duration": "45s", "reps": "", "weight": "", "rest": "60s"}
     ]
   }
 ]',
 ARRAY['Strength Endurance', 'General Endurance'],
 'Builds the foundational strength needed for HYROX while improving muscular endurance.',
 'Focus on quality movement over speed.');

-- Insert Sample Workout Classes
INSERT INTO workout_classes (id, class_number, name, description, date, time, duration, numerical_intensity, number_of_blocks, max_participants, instructor, routine_key, class_focus, status) VALUES
('class-1', 1, 'HYROX Station Focus (High Intensity)', 'Targeted training for specific HYROX stations', 
 '2025-02-10', '18:00', 60, 8, 1, 16, 'Coach Sarah', 'hyrox-station-focus', 'Competition Preparation', 'approved'),
('class-2', 2, 'Functional Strength Circuit (Moderate Intensity)', 'Build strength through functional movement patterns',
 '2025-02-11', '17:30', 60, 6, 1, 20, 'Coach Mike', 'functional-strength', 'Strength Development', 'approved'),
('class-3', 3, 'HYROX Station Focus (Moderate Intensity)', 'Targeted training for specific HYROX stations',
 '2025-02-12', '19:00', 60, 6, 1, 16, 'Coach Sarah', 'hyrox-station-focus', 'Competition Preparation', 'approved');

-- Verify data insertion
SELECT 'Events' as table_name, COUNT(*) as record_count FROM events
UNION ALL
SELECT 'Event Registrations', COUNT(*) FROM event_registrations
UNION ALL
SELECT 'Event Sponsors', COUNT(*) FROM event_sponsors
UNION ALL
SELECT 'Sponsorship Packages', COUNT(*) FROM sponsorship_packages
UNION ALL
SELECT 'Sponsorship Inquiries', COUNT(*) FROM sponsorship_inquiries
UNION ALL
SELECT 'Programs', COUNT(*) FROM programs
UNION ALL
SELECT 'Workout Routines', COUNT(*) FROM workout_routines
UNION ALL
SELECT 'Workout Classes', COUNT(*) FROM workout_classes;
