// Quick test to verify .env is being loaded
require('dotenv').config();

console.log('\n=== Environment Variable Check ===');
console.log('LEONARDO_API_KEY:', process.env.LEONARDO_API_KEY ? 
  `✅ SET (${process.env.LEONARDO_API_KEY.length} characters, starts with: ${process.env.LEONARDO_API_KEY.substring(0, 10)}...)` : 
  '❌ NOT SET');

console.log('\nAll LEONARDO-related vars:');
Object.keys(process.env)
  .filter(key => key.toUpperCase().includes('LEONARDO'))
  .forEach(key => {
    const value = process.env[key];
    console.log(`  ${key}: ${value ? `SET (${value.length} chars)` : 'NOT SET'}`);
  });

console.log('\n=== Check .env file format ===');
console.log('Make sure your .env file has this exact format:');
console.log('LEONARDO_API_KEY=your_actual_key_here');
console.log('\n(No spaces around =, no quotes, no comments on same line)\n');
