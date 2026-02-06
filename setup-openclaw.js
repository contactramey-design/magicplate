#!/usr/bin/env node
/**
 * OpenClaw Setup Helper for MagicPlate
 * Helps verify and configure OpenClaw integration
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🦞 OpenClaw Setup for MagicPlate.ai\n');

// Check if OpenClaw is installed
function checkOpenClaw() {
  const { execSync } = require('child_process');
  try {
    execSync('which openclaw', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Check API keys
function checkAPIKeys() {
  const required = {
    'RESEND_API_KEY': 'Email automation',
    'GOOGLE_PLACES_API_KEY': 'Restaurant scraping'
  };
  
  const optional = {
    'VAPI_API_KEY': 'WhatsApp outreach',
    'TELEGRAM_BOT_TOKEN': 'Telegram bot',
    'INSTAGRAM_ACCESS_TOKEN': 'Instagram posting',
    'FACEBOOK_ACCESS_TOKEN': 'Facebook posting'
  };
  
  console.log('📋 API Key Status:\n');
  
  console.log('Required:');
  let allRequired = true;
  for (const [key, description] of Object.entries(required)) {
    const isSet = !!process.env[key];
    console.log(`   ${isSet ? '✅' : '❌'} ${key} - ${description}`);
    if (!isSet) allRequired = false;
  }
  
  console.log('\nOptional:');
  for (const [key, description] of Object.entries(optional)) {
    const isSet = !!process.env[key];
    console.log(`   ${isSet ? '✅' : '⚪'} ${key} - ${description}`);
  }
  
  return allRequired;
}

// Check if skills directory exists
function checkSkills() {
  const skillsDir = path.join(__dirname, 'openclaw-skills');
  const skills = [
    'magicplate-email.js',
    'magicplate-scraping.js',
    'magicplate-outreach.js',
    'index.js'
  ];
  
  console.log('\n📦 MagicPlate Skills:\n');
  
  if (!fs.existsSync(skillsDir)) {
    console.log('   ❌ Skills directory not found');
    return false;
  }
  
  let allSkills = true;
  for (const skill of skills) {
    const skillPath = path.join(skillsDir, skill);
    const exists = fs.existsSync(skillPath);
    console.log(`   ${exists ? '✅' : '❌'} ${skill}`);
    if (!exists) allSkills = false;
  }
  
  return allSkills;
}

// Check data directory
function checkDataDirectory() {
  const dataDir = path.join(__dirname, 'data');
  console.log('\n📁 Data Directory:\n');
  
  if (!fs.existsSync(dataDir)) {
    console.log('   ⚠️  Creating data directory...');
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('   ✅ Created');
  } else {
    console.log('   ✅ Exists');
  }
  
  const files = ['qualified-leads.json', 'all-leads.json', 'sent-emails.json', 'outreach-tracking.json'];
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const exists = fs.existsSync(filePath);
    console.log(`   ${exists ? '✅' : '⚪'} ${file}`);
  }
}

// Main setup check
function main() {
  console.log('Checking setup status...\n');
  
  // Check OpenClaw installation
  console.log('🔍 OpenClaw Installation:');
  const openclawInstalled = checkOpenClaw();
  if (openclawInstalled) {
    console.log('   ✅ OpenClaw is installed\n');
  } else {
    console.log('   ❌ OpenClaw is not installed\n');
    console.log('   Run: curl -fsSL https://openclaw.ai/install.sh | bash\n');
  }
  
  // Check API keys
  const apiKeysOk = checkAPIKeys();
  
  // Check skills
  const skillsOk = checkSkills();
  
  // Check data directory
  checkDataDirectory();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Setup Summary');
  console.log('='.repeat(60));
  console.log(`OpenClaw: ${openclawInstalled ? '✅ Installed' : '❌ Not Installed'}`);
  console.log(`API Keys: ${apiKeysOk ? '✅ All Required Set' : '❌ Missing Required Keys'}`);
  console.log(`Skills: ${skillsOk ? '✅ All Present' : '❌ Missing Skills'}`);
  console.log('='.repeat(60));
  
  if (openclawInstalled && apiKeysOk && skillsOk) {
    console.log('\n🎉 Setup Complete! Next steps:\n');
    console.log('1. Run: openclaw onboard');
    console.log('2. Connect WhatsApp/Telegram');
    console.log('3. Start chatting with your assistant!\n');
    console.log('See OPENCLAW_QUICK_START.md for details\n');
  } else {
    console.log('\n⚠️  Setup incomplete. Please fix the issues above.\n');
    
    if (!openclawInstalled) {
      console.log('To install OpenClaw:');
      console.log('  curl -fsSL https://openclaw.ai/install.sh | bash\n');
    }
    
    if (!apiKeysOk) {
      console.log('To add API keys:');
      console.log('  1. Edit your .env file');
      console.log('  2. Add missing API keys');
      console.log('  3. See ENV_VARIABLES.md for details\n');
    }
  }
}

main();
