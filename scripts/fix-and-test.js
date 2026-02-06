#!/usr/bin/env node
/**
 * Fix Common Issues and Test Automation
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

console.log('🔧 Fixing and Testing MagicPlate Automation\n');

// 1. Ensure data files exist
async function ensureDataFiles() {
  console.log('📁 Ensuring data files exist...');
  const dataDir = path.join(__dirname, '..', 'data');
  await fs.mkdir(dataDir, { recursive: true });
  
  const files = {
    'sent-emails.json': { sent: [], stats: { total: 0, successful: 0, failed: 0 } },
    'outreach-tracking.json': {
      total: 0,
      successful: 0,
      failed: 0,
      by_channel: {
        email: { sent: 0, failed: 0 },
        whatsapp: { sent: 0, failed: 0 },
        telegram: { sent: 0, failed: 0 },
        facebook: { sent: 0, failed: 0 },
        instagram: { sent: 0, failed: 0 }
      },
      contacts: []
    }
  };
  
  for (const [filename, defaultContent] of Object.entries(files)) {
    const filePath = path.join(dataDir, filename);
    try {
      await fs.access(filePath);
      console.log(`   ✅ ${filename} exists`);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultContent, null, 2));
      console.log(`   ✅ Created ${filename}`);
    }
  }
}

// 2. Test email config
async function testEmailConfig() {
  console.log('\n📧 Testing email configuration...');
  try {
    const emailConfig = require('../config/email-config');
    const hasResend = !!process.env.RESEND_API_KEY;
    const hasSendGrid = !!process.env.SENDGRID_API_KEY;
    
    if (hasResend || hasSendGrid) {
      console.log(`   ✅ Email service configured (${hasResend ? 'Resend' : 'SendGrid'})`);
      return true;
    } else {
      console.log('   ⚠️  No email service configured');
      console.log('      Add RESEND_API_KEY or SENDGRID_API_KEY to .env');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Email config error: ${error.message}`);
    return false;
  }
}

// 3. Test scraping config
async function testScrapingConfig() {
  console.log('\n🔍 Testing scraping configuration...');
  const hasGoogle = !!process.env.GOOGLE_PLACES_API_KEY;
  const hasYelp = !!process.env.YELP_API_KEY;
  const hasOutscraper = !!process.env.OUTSCRAPER_API_KEY;
  
  if (hasGoogle || hasYelp || hasOutscraper) {
    const services = [];
    if (hasGoogle) services.push('Google Places');
    if (hasYelp) services.push('Yelp');
    if (hasOutscraper) services.push('Outscraper');
    console.log(`   ✅ Scraping service configured (${services.join(', ')})`);
    return true;
  } else {
    console.log('   ⚠️  No scraping service configured');
    console.log('      Add GOOGLE_PLACES_API_KEY, YELP_API_KEY, or OUTSCRAPER_API_KEY to .env');
    return false;
  }
}

// 4. Test module imports
async function testImports() {
  console.log('\n📦 Testing module imports...');
  const modules = [
    '../config/email-config',
    '../lib/outreach-channels',
    '../lib/outreach-orchestrator'
  ];
  
  let allGood = true;
  for (const modulePath of modules) {
    try {
      require(modulePath);
      console.log(`   ✅ ${modulePath.split('/').pop()}`);
    } catch (error) {
      console.log(`   ❌ ${modulePath.split('/').pop()}: ${error.message}`);
      allGood = false;
    }
  }
  return allGood;
}

// 5. Dry run test
async function dryRunTest() {
  console.log('\n🧪 Running dry-run tests...');
  
  // Test email preview
  try {
    const sendEmail = require('./send-email');
    console.log('   ✅ Email script loads');
  } catch (error) {
    console.log(`   ❌ Email script: ${error.message}`);
  }
  
  // Test scraping preview
  try {
    const scrape = require('./scrape-restaurants');
    console.log('   ✅ Scraping script loads');
  } catch (error) {
    console.log(`   ❌ Scraping script: ${error.message}`);
  }
  
  // Test outreach preview
  try {
    const outreach = require('./multi-channel-outreach');
    console.log('   ✅ Outreach script loads');
  } catch (error) {
    console.log(`   ❌ Outreach script: ${error.message}`);
  }
}

async function main() {
  await ensureDataFiles();
  await testEmailConfig();
  await testScrapingConfig();
  await testImports();
  await dryRunTest();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Fix and test complete!');
  console.log('='.repeat(60));
  console.log('\nNext steps:');
  console.log('1. Add missing API keys to .env file');
  console.log('2. Run: npm run email:preview (to test email)');
  console.log('3. Run: npm run scrape (to test scraping)');
  console.log('4. Run: npm run outreach:preview (to test outreach)');
  console.log('\n');
}

main().catch(console.error);
