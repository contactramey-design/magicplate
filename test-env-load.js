#!/usr/bin/env node
/**
 * Test script to verify .env file is being read correctly
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Testing .env file loading...\n');

const envPath = path.join(__dirname, '.env');
const envLocalPath = path.join(__dirname, '.env.local');

// Check if files exist
console.log('File existence:');
console.log('  .env:', fs.existsSync(envPath) ? '✅ EXISTS' : '❌ NOT FOUND');
console.log('  .env.local:', fs.existsSync(envLocalPath) ? '✅ EXISTS' : '⚪ Not found');

// Try to read .env file content (if we can)
if (fs.existsSync(envPath)) {
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const leonardoLine = content.split('\n').find(line => 
      line.trim().toUpperCase().includes('LEONARDO') && 
      !line.trim().startsWith('#')
    );
    
    if (leonardoLine) {
      console.log('\n✅ Found LEONARDO line in .env:');
      console.log('   ', leonardoLine.trim().substring(0, 60) + '...');
      
      // Check format
      const match = leonardoLine.match(/LEONARDO_API_KEY\s*=\s*(.+)/i);
      if (match) {
        const value = match[1].trim();
        console.log('\n✅ Value extracted:', value.substring(0, 20) + '...');
        console.log('   Length:', value.length);
      } else {
        console.log('\n⚠️  Could not parse value from line');
      }
    } else {
      console.log('\n❌ No LEONARDO_API_KEY line found in .env file');
    }
  } catch (error) {
    console.log('\n⚠️  Could not read .env file:', error.message);
  }
}

// Test dotenv loading
console.log('\n📦 Testing dotenv.config()...');
require('dotenv').config({ path: envPath });

if (fs.existsSync(envLocalPath)) {
  require('dotenv').config({ path: envLocalPath, override: true });
  console.log('  Also loaded .env.local');
}

const key = process.env.LEONARDO_API_KEY;

if (key) {
  console.log('\n✅ LEONARDO_API_KEY loaded successfully!');
  console.log('   Length:', key.length);
  console.log('   Preview:', key.substring(0, 20) + '...');
  console.log('   Full value:', key);
} else {
  console.log('\n❌ LEONARDO_API_KEY NOT loaded');
  console.log('\n💡 Troubleshooting:');
  console.log('   1. Make sure you SAVED the .env file in VS Code (Ctrl+S / Cmd+S)');
  console.log('   2. Check line 16 has: LEONARDO_API_KEY=your_key (no spaces, no quotes)');
  console.log('   3. Make sure there are no hidden characters');
  console.log('   4. Try restarting VS Code');
}

console.log('\n');
