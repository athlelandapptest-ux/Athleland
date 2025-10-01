// Script to fix class numbers in the database
// This will update all classes to have sequential class numbers

import { neon } from '@neondatabase/serverless';
async function fixClassNumbers() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL environment variable is not set');
      process.exit(1);
    }

    const sql = neon(databaseUrl);
    
    console.log('🔄 Fetching all classes...');
    
    // Get all classes ordered by creation date
    const classes = await sql`
      SELECT id, title, name, created_at, class_number
      FROM classes
      ORDER BY created_at ASC
    `;
    
    console.log(`📊 Found ${classes.length} classes`);
    
    if (classes.length === 0) {
      console.log('✅ No classes to update');
      return;
    }
    
    console.log('🔄 Updating class numbers...');
    
    // Update each class with sequential numbers
    for (let i = 0; i < classes.length; i++) {
      const newClassNumber = i + 1;
      const classId = classes[i].id;
      const className = classes[i].title || classes[i].name;
      
      await sql`
        UPDATE classes
        SET class_number = ${newClassNumber}
        WHERE id = ${classId}
      `;
      
      console.log(`  ✓ Updated "${className}" to CLASS #${newClassNumber}`);
    }
    
    console.log('✅ Successfully updated all class numbers!');
    
    // Verify the update
    console.log('\n📋 Final class numbers:');
    const updatedClasses = await sql`
      SELECT id, title, name, class_number
      FROM classes
      ORDER BY class_number ASC
    `;
    
    updatedClasses.forEach(cls => {
      console.log(`  CLASS #${cls.class_number} - ${cls.title || cls.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing class numbers:', error);
    process.exit(1);
  }
}

fixClassNumbers();
