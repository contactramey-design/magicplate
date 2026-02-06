#!/usr/bin/env node
/**
 * Comprehensive Setup Verification
 * Checks all aspects of the Leonardo API setup
 */

require('dotenv').config();

console.log('\n🔍 MagicPlate.ai - Leonardo API Setup Verification\n');
console.log('='.repeat(60));

// 1. Check environment variables
console.log('\n1️⃣  Environment Variables:');
console.log('-'.repeat(60));

const leonardoKey = process.env.LEONARDO_API_KEY;
const togetherKey = process.env.TOGETHER_API_KEY;
const replicateKey = process.env.REPLICATE_API_TOKEN;

if (leonardoKey) {
  if (leonardoKey === 'your_leonardo_api_key_here' || leonardoKey.length < 10) {
    console.log('❌ LEONARDO_API_KEY: Set but appears to be placeholder or invalid');
    console.log('   Length:', leonardoKey.length);
  } else {
    console.log(`✅ LEONARDO_API_KEY: Set (${leonardoKey.length} characters)`);
    console.log(`   Preview: ${leonardoKey.substring(0, 15)}...`);
  }
} else {
  console.log('❌ LEONARDO_API_KEY: NOT SET');
  console.log('   Add to .env: LEONARDO_API_KEY=your_key_here');
}

if (togetherKey) {
  console.log(`✅ TOGETHER_API_KEY: Set (${togetherKey.length} characters)`);
} else {
  console.log('⚪ TOGETHER_API_KEY: Not set (optional)');
}

if (replicateKey) {
  console.log(`✅ REPLICATE_API_TOKEN: Set (${replicateKey.length} characters)`);
} else {
  console.log('⚪ REPLICATE_API_TOKEN: Not set (optional)');
}

// 2. Check API file
console.log('\n2️⃣  API Implementation:');
console.log('-'.repeat(60));

const fs = require('fs');
const path = require('path');

const apiFile = path.join(__dirname, 'api', 'enhance-image.js');
if (fs.existsSync(apiFile)) {
  const content = fs.readFileSync(apiFile, 'utf8');
  
  const checks = {
    'dotenv.config()': content.includes("require('dotenv').config()"),
    'LEONARDO_API_KEY check': content.includes('LEONARDO_API_KEY'),
    'Leonardo function': content.includes('enhanceImageWithLeonardo'),
    'Presigned URL flow': content.includes('presignedUrl') || content.includes('presigned'),
    'PhotoReal settings': content.includes('photoReal') || content.includes('FOOD'),
  };
  
  Object.entries(checks).forEach(([check, passed]) => {
    console.log(passed ? '✅' : '❌', check);
  });
} else {
  console.log('❌ api/enhance-image.js not found!');
}

// 3. Check server file
console.log('\n3️⃣  Server Configuration:');
console.log('-'.repeat(60));

const serverFile = path.join(__dirname, 'server.js');
if (fs.existsSync(serverFile)) {
  const content = fs.readFileSync(serverFile, 'utf8');
  
  const checks = {
    'dotenv.config()': content.includes("require('dotenv').config()"),
    'Express server': content.includes('express'),
    'API route': content.includes('/api/enhance-image') || content.includes('enhance-image'),
    'Static files': content.includes('express.static'),
  };
  
  Object.entries(checks).forEach(([check, passed]) => {
    console.log(passed ? '✅' : '❌', check);
  });
} else {
  console.log('❌ server.js not found!');
}

// 4. Recommendations
console.log('\n4️⃣  Recommendations:');
console.log('-'.repeat(60));

if (!leonardoKey || leonardoKey === 'your_leonardo_api_key_here') {
  console.log('📝 ACTION REQUIRED:');
  console.log('   1. Get your Leonardo API key from https://leonardo.ai');
  console.log('   2. Open .env file in project root');
  console.log('   3. Add: LEONARDO_API_KEY=your_actual_key_here');
  console.log('   4. Make sure NO spaces around =, NO quotes');
  console.log('   5. Restart server: npm run dev');
} else {
  console.log('✅ Setup looks good!');
  console.log('   Try uploading an image at http://localhost:3000');
  console.log('   Check server logs if you encounter errors');
}

console.log('\n' + '='.repeat(60));
console.log('');
