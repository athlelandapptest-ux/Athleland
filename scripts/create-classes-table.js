require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function createClassesTable() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('Creating classes table for production use...');
    
    // Drop existing table if it exists and create a new one with the correct structure
    await sql`DROP TABLE IF EXISTS classes CASCADE`;
    
    await sql`
      CREATE TABLE classes (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        time TIME NOT NULL,
        duration INTEGER DEFAULT 60,
        intensity INTEGER DEFAULT 5,
        numerical_intensity INTEGER DEFAULT 5,
        class_number VARCHAR(50),
        class_focus VARCHAR(255),
        number_of_blocks INTEGER DEFAULT 1,
        difficulty VARCHAR(50) DEFAULT 'Intermediate',
        max_participants INTEGER DEFAULT 20,
        instructor VARCHAR(255),
        status VARCHAR(50) DEFAULT 'draft',
        routine JSONB,
        routines JSONB,
        workout_breakdown JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('✅ Classes table created successfully');
    
    // Test the table
    const result = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'classes' ORDER BY ordinal_position`;
    console.log('📋 Classes table columns:');
    result.forEach(row => console.log(`  - ${row.column_name}: ${row.data_type}`));
    
  } catch (error) {
    console.error('❌ Failed to create classes table:', error);
  }
}

createClassesTable();
