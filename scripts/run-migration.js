require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

async function runMigration() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // First, run the main schema creation
    console.log('Running main schema creation...');
    const mainSchema = fs.readFileSync('./scripts/001-create-tables.sql', 'utf8');
    
    // Better parsing - split on semicolon but preserve multi-line statements
    const allStatements = [];
    let currentStatement = '';
    const lines = mainSchema.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('--') || trimmedLine === '') {
        continue; // Skip comments and empty lines
      }
      
      currentStatement += ' ' + trimmedLine;
      
      if (trimmedLine.endsWith(';')) {
        allStatements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
    
    // Filter by statement type
    const extensions = allStatements.filter(stmt => stmt.includes('CREATE EXTENSION'));
    const tables = allStatements.filter(stmt => stmt.includes('CREATE TABLE'));
    const functions = allStatements.filter(stmt => stmt.includes('CREATE OR REPLACE FUNCTION'));
    const indexes = allStatements.filter(stmt => stmt.includes('CREATE INDEX'));
    const triggers = allStatements.filter(stmt => stmt.includes('CREATE TRIGGER'));
    const alters = allStatements.filter(stmt => stmt.includes('ALTER TABLE'));
    
    console.log(`Found: ${extensions.length} extensions, ${tables.length} tables, ${functions.length} functions, ${indexes.length} indexes, ${triggers.length} triggers, ${alters.length} alters`);
    
    for (const group of [extensions, tables, functions, indexes, triggers, alters]) {
      for (const statement of group) {
        try {
          console.log('Executing:', statement.substring(0, 80) + '...');
          await sql.query(statement);
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log('✓ Skipping (already exists)');
          } else {
            console.log('⚠️  Error:', error.message);
          }
        }
      }
    }
    
    // Then run the update migration
    console.log('\\nRunning workout_classes table updates...');
    const migration = fs.readFileSync('./scripts/003-update-classes-table.sql', 'utf8');
    const statements = migration
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      try {
        console.log('Executing:', statement.substring(0, 80) + '...');
        await sql.query(statement);
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('does not exist')) {
          console.log('✓ Skipping (conditional)');
        } else {
          console.log('⚠️  Error:', error.message);
        }
      }
    }
    
    console.log('✅ Migration completed successfully');
    
    // Test the connection
    const result = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'workout_classes' ORDER BY ordinal_position`;
    console.log('\\n📋 Current workout_classes columns:');
    result.forEach(row => console.log('  -', row.column_name));
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

runMigration();
