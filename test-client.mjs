import { fetchAllClasses } from './app/actions.js';

async function testClientSide() {
  try {
    console.log('🧪 Testing fetchAllClasses from client perspective...');
    const classes = await fetchAllClasses();
    
    console.log(`📊 Retrieved ${classes.length} classes`);
    console.log('📋 Classes:', classes);
    
    if (classes.length > 0) {
      const firstClass = classes[0];
      console.log('🔍 First class structure:');
      console.log('  ID:', firstClass.id);
      console.log('  Name:', firstClass.name || firstClass.title);
      console.log('  Date:', firstClass.date);
      console.log('  Status:', firstClass.status);
      console.log('  Intensity:', firstClass.intensity);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testClientSide();
