// Quick test - run this in your terminal
require('dotenv').config();

console.log('\n=== Quick Environment Test ===\n');

// Test loading from both files
const path = require('path');
const fs = require('fs');

// Load in same order as server: .env.local first, then .env (overrides)
console.log('1. Testing .env.local loading...');
if (require('fs').existsSync(path.join(__dirname, '.env.local'))) {
  require('dotenv').config({ path: path.join(__dirname, '.env.local') });
}

console.log('2. Testing .env loading (overrides .env.local)...');
if (require('fs').existsSync(path.join(__dirname, '.env'))) {
  require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });
}

let key = process.env.LEONARDO_API_KEY;
console.log('   LEONARDO_API_KEY:', key ? `✅ SET (${key.length} chars)` : '❌ NOT SET');

if (key) {
  console.log('\n✅ SUCCESS! Key is loaded.');
  console.log('   Value:', key.substring(0, 20) + '...');
  console.log('\n💡 If this works but server doesn\'t, make sure:');
  console.log('   1. You saved .env.local in VS Code (Cmd+S)');
  console.log('   2. Server is restarted (npm run dev)');
} else {
  console.log('\n❌ Key still not loading.');
  console.log('\n💡 Check:');
  console.log('   1. Is .env.local saved? (Cmd+S in VS Code)');
  console.log('   2. Does the line look exactly like this?');
  console.log('      LEONARDO_API_KEY=02a4b18f-77d5-42ee-b68b-beb43e277849');
  console.log('      (NO spaces, NO quotes, NO comments)');
}

console.log('\n');
