#!/usr/bin/env node
/**
 * Add All API Keys to .env file
 * This script automatically adds all your API keys to the .env file
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

// All keys to add (your actual API keys)
const keysToAdd = {
  // Email Service (Required)
  RESEND_API_KEY: 're_9Va9PPPZ_LQ6od53eR2RWWr35piKNFrj3',
  FROM_EMAIL: 'sydney@magicplate.info',
  FROM_NAME: 'Sydney - MagicPlate',
  
  // Restaurant Scraping (Required)
  GOOGLE_PLACES_API_KEY: 'AIzaSyBg90qetc06qivgBX9b-kJlxVVXuBz_FMI',
  
  // Image Enhancement (Optional but recommended)
  LEONARDO_API_KEY: '02a4b18f-77d5-42ee-b68b-beb43e277849',
  REPLICATE_API_TOKEN: 'YOUR_REPLICATE_API_TOKEN',
  
  // Search Configuration
  SEARCH_AREA: 'Los Angeles, CA'
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
    existingKeys[key] = match[1].trim();
  }
});

// Organize keys by category
const keyCategories = {
  'Email Service': ['RESEND_API_KEY', 'FROM_EMAIL', 'FROM_NAME'],
  'Restaurant Scraping': ['GOOGLE_PLACES_API_KEY'],
  'Image Enhancement': ['LEONARDO_API_KEY', 'REPLICATE_API_TOKEN'],
  'Search Configuration': ['SEARCH_AREA']
};

// Add/update keys with better organization
let addedCount = 0;
let updatedCount = 0;
let skippedCount = 0;

// Add category headers if file is new or empty
if (!envContent.trim()) {
  envContent = '# MagicPlate.ai Environment Variables\n# Generated automatically - do not commit to git\n\n';
}

// Process each category
Object.entries(keyCategories).forEach(([category, keys]) => {
  // Check if we need to add category header
  const categoryHeader = `\n# ${category}\n`;
  const hasCategoryHeader = envContent.includes(`# ${category}`);
  
  if (!hasCategoryHeader && keys.some(key => !existingKeys[key])) {
    envContent += categoryHeader;
  }
  
  keys.forEach(key => {
    if (!keysToAdd[key]) return; // Skip if key not in keysToAdd
    
    const value = keysToAdd[key];
    const regex = new RegExp(`^${key}=.+$`, 'm');
    
    if (existingKeys[key]) {
      if (existingKeys[key] !== value) {
        // Update existing key
        envContent = envContent.replace(regex, `${key}=${value}`);
        updatedCount++;
        console.log(`🔄 Updated: ${key}`);
      } else {
        skippedCount++;
        console.log(`✅ Already correct: ${key}`);
      }
    } else {
      // Add new key
      if (envContent && !envContent.endsWith('\n')) {
        envContent += '\n';
      }
      envContent += `${key}=${value}\n`;
      addedCount++;
      console.log(`➕ Added: ${key}`);
    }
  });
});

// Write back to .env
try {
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Successfully updated .env file!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`   ➕ Added: ${addedCount} keys`);
  console.log(`   🔄 Updated: ${updatedCount} keys`);
  console.log(`   ✅ Already set: ${skippedCount} keys`);
  console.log(`\n🎉 All API keys are now configured!`);
  
  // Show what was added
  if (addedCount > 0 || updatedCount > 0) {
    console.log(`\n📋 Keys configured:`);
    Object.entries(keysToAdd).forEach(([key, value]) => {
      const status = existingKeys[key] === value ? '✅' : (addedCount > 0 ? '➕' : '🔄');
      console.log(`   ${status} ${key}`);
    });
  }
  
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Test configuration: node scripts/test-all-automation.js`);
  console.log(`   2. Verify Resend domain: https://resend.com/domains`);
  console.log(`   3. Enable Google billing: https://console.cloud.google.com/billing`);
  console.log(`   4. Test scraping: npm run scrape`);
  console.log(`   5. Test email: npm run email:preview`);
  console.log(`\n📚 See YOUR_PERSONALIZED_SETUP.md for detailed instructions`);
  console.log(`${'='.repeat(60)}\n`);
} catch (error) {
  console.error('\n❌ Error writing to .env:', error.message);
  console.log('\n📝 Please add these keys manually to your .env file:\n');
  Object.entries(keyCategories).forEach(([category, keys]) => {
    console.log(`# ${category}`);
    keys.forEach(key => {
      if (keysToAdd[key]) {
        console.log(`${key}=${keysToAdd[key]}`);
      }
    });
    console.log('');
  });
  console.log('\n💡 Tip: The .env file might be protected. Try running with different permissions or edit manually.');
  process.exit(1);
}
RESEND_API_KEY=re_9Va9PPPZ_LQ6od53eR2RWWr35piKNFrj3
FROM_EMAIL=sydney@magicplate.info
FROM_NAME="Sydney - MagicPlate"
GOOGLE_PLACES_API_KEY=AIzaSyBg90qetc06qivgBX9b-kJlxVVXuBz_FMI
LEONARDO_API_KEY=02a4b18f-77d5-42ee-b68b-beb43e277849
REPLICATE_API_TOKEN=YOUR_REPLICATE_API_TOKEN
SEARCH_AREA="Los Angeles, CA"