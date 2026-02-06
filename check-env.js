#!/usr/bin/env node
/**
 * Environment Variable Checker and Fixer
 * Verifies .env file format and helps fix issues
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

console.log('\n🔍 Checking .env file...\n');

// Check if .env exists
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('📝 Creating .env from .env.example...');
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file');
  } else {
    console.log('⚠️  .env.example not found, creating basic .env...');
    fs.writeFileSync(envPath, '# Environment Variables\n');
  }
}

// Read .env file
let envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

console.log('📄 Current .env file contents:');
console.log('─'.repeat(50));

let leonardoFound = false;
let leonardoLine = null;
let leonardoIndex = -1;

lines.forEach((line, index) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    if (trimmed.toUpperCase().includes('LEONARDO')) {
      leonardoFound = true;
      leonardoLine = line;
      leonardoIndex = index;
      console.log(`📍 Line ${index + 1}: ${line.substring(0, 60)}${line.length > 60 ? '...' : ''}`);
    } else {
      console.log(`   Line ${index + 1}: ${trimmed.substring(0, 60)}${trimmed.length > 60 ? '...' : ''}`);
    }
  }
});

console.log('─'.repeat(50));

// Check Leonardo API key
if (!leonardoFound) {
  console.log('\n❌ LEONARDO_API_KEY not found in .env file');
  console.log('📝 Adding LEONARDO_API_KEY placeholder...');
  
  envContent += '\n# Image Enhancement API\n';
  envContent += 'LEONARDO_API_KEY=your_leonardo_api_key_here\n';
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Added LEONARDO_API_KEY to .env file');
  console.log('\n⚠️  Please edit .env and replace "your_leonardo_api_key_here" with your actual key!');
} else {
  // Check format
  const match = leonardoLine.match(/^([^=#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    
    // Check for common issues
    const issues = [];
    
    if (key !== 'LEONARDO_API_KEY') {
      issues.push(`Wrong variable name: "${key}" (should be "LEONARDO_API_KEY")`);
    }
    
    if (value.startsWith('"') && value.endsWith('"')) {
      issues.push('Has quotes around value (remove them)');
    }
    
    if (value.startsWith("'") && value.endsWith("'")) {
      issues.push("Has single quotes around value (remove them)");
    }
    
    if (value === 'your_leonardo_api_key_here' || value === '' || !value) {
      issues.push('Value is placeholder or empty (add your actual API key)');
    }
    
    if (key.includes(' ') || value.includes(' ') && !value.startsWith('"')) {
      issues.push('Has spaces (remove spaces around =)');
    }
    
    if (issues.length > 0) {
      console.log('\n⚠️  Found issues with LEONARDO_API_KEY:');
      issues.forEach(issue => console.log(`   - ${issue}`));
      
      // Fix common issues
      console.log('\n🔧 Attempting to fix...');
      const fixedLine = `LEONARDO_API_KEY=${value.replace(/^["']|["']$/g, '')}`;
      lines[leonardoIndex] = fixedLine;
      
      fs.writeFileSync(envPath, lines.join('\n'));
      console.log('✅ Fixed format issues');
    } else {
      console.log('\n✅ LEONARDO_API_KEY format looks correct!');
    }
  } else {
    console.log('\n⚠️  Could not parse LEONARDO_API_KEY line');
    console.log(`   Line: ${leonardoLine}`);
  }
}

// Test loading
console.log('\n🧪 Testing environment variable loading...');
require('dotenv').config({ path: envPath });

const apiKey = process.env.LEONARDO_API_KEY;

if (apiKey && apiKey !== 'your_leonardo_api_key_here' && apiKey.length > 10) {
  console.log(`✅ LEONARDO_API_KEY is loaded: ${apiKey.length} characters`);
  console.log(`   Starts with: ${apiKey.substring(0, 10)}...`);
} else if (apiKey === 'your_leonardo_api_key_here') {
  console.log('⚠️  LEONARDO_API_KEY is still the placeholder');
  console.log('   Please edit .env and add your actual API key');
} else {
  console.log('❌ LEONARDO_API_KEY is not loaded correctly');
  console.log('   Value:', apiKey || '(empty)');
}

console.log('\n');
