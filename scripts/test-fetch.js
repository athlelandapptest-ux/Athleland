const { fetchAllClasses } = require('../app/actions.js');
require('dotenv').config({ path: '.env.local' });

async function testFetch() {
  try {
    console.log('🧪 Testing fetchAllClasses...');
    const classes = await fetchAllClasses();
    
    console.log(`📊 Retrieved ${classes.length} classes`);
    
    if (classes.length > 0) {
      const firstClass = classes[0];
      console.log('\n🔍 First class data types:');
      Object.keys(firstClass).forEach(key => {
        const value = firstClass[key];
        const type = typeof value;
        const constructor = value?.constructor?.name || 'null';
        console.log(`  ${key}: ${type} (${constructor}) = ${value}`);
      });
      
      // Specifically check date field
      console.log(`\n📅 Date field check:`);
      console.log(`  Raw date: ${firstClass.date}`);
      console.log(`  Type: ${typeof firstClass.date}`);
      console.log(`  Is string: ${typeof firstClass.date === 'string'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testFetch();
