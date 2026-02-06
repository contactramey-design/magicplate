#!/usr/bin/env node
/**
 * Add API Keys to .env file
 * Found your keys in documentation files
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

// Keys found in your documentation
const keysToAdd = {
  RESEND_API_KEY: 're_9Va9PPPZ_LQ6od53eR2RWWr35piKNFrj3',
  GOOGLE_PLACES_API_KEY: 'AIzaSyBg90qetc06qivgBX9b-kJlxVVXuBz_FMI',
  LEONARDO_API_KEY: '02a4b18f-77d5-42ee-b68b-beb43e277849',
  FROM_EMAIL: 'sydney@magicplate.info',
  FROM_NAME: 'Sydney - MagicPlate'
};

// Read existing .env
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.log('⚠️  .env file not found, will create new one');
}

// Check what's already there
const existingKeys = {};
Object.keys(keysToAdd).forEach(key => {
  const regex = new RegExp(`^${key}=(.+)$`, 'm');
  const match = envContent.match(regex);
  if (match) {
    existingKeys[key] = match[1];
  }
});

// Add missing keys
let addedCount = 0;
let updatedCount = 0;

Object.entries(keysToAdd).forEach(([key, value]) => {
  const regex = new RegExp(`^${key}=.+$`, 'm');
  
  if (existingKeys[key]) {
    if (existingKeys[key] !== value) {
      // Update existing key
      envContent = envContent.replace(regex, `${key}=${value}`);
      updatedCount++;
      console.log(`🔄 Updated: ${key}`);
    } else {
      console.log(`✅ Already set: ${key}`);
    }
  } else {
    // Add new key
    if (envContent && !envContent.endsWith('\n')) {
      envContent += '\n';
    }
    envContent += `\n# ${key} - Added automatically\n${key}=${value}\n`;
    addedCount++;
    console.log(`➕ Added: ${key}`);
  }
});

// Write back to .env
try {
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log(`\n✅ Successfully updated .env file!`);
  console.log(`   Added: ${addedCount} keys`);
  console.log(`   Updated: ${updatedCount} keys`);
  console.log(`\n🎉 Your API keys are now configured!`);
  console.log(`\nNext steps:`);
  console.log(`   npm run scrape          # Find restaurants`);
  console.log(`   npm run outreach:test   # Test outreach`);
} catch (error) {
  console.error('❌ Error writing to .env:', error.message);
  console.log('\n📝 Please add these keys manually to your .env file:');
  Object.entries(keysToAdd).forEach(([key, value]) => {
    console.log(`   ${key}=${value}`);
  });
  process.exit(1);
}
