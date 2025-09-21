const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('🔍 Checking classes table schema...');
    
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'classes' 
      ORDER BY ordinal_position
    `;
    
    console.log('Classes table schema:');
    result.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
    
    // Also check if there are any records and their types
    console.log('\n🔍 Sample data types:');
    const sample = await sql`SELECT * FROM classes LIMIT 1`;
    if (sample.length > 0) {
      const record = sample[0];
      Object.keys(record).forEach(key => {
        const value = record[key];
        const type = typeof value;
        const constructor = value?.constructor?.name || 'null';
        console.log(`  ${key}: ${type} (${constructor}) = ${value}`);
      });
    } else {
      console.log('  No records found in classes table');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkSchema();
