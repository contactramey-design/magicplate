#!/usr/bin/env node
/**
 * Comprehensive Test Suite for MagicPlate Automation
 * Tests all automation systems and reports issues
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

const results = {
  passed: [],
  failed: [],
  warnings: []
};

async function testAPIKeys() {
  logSection('🔑 Testing API Keys');
  
  const required = {
    'RESEND_API_KEY': 'Email automation (Resend)',
    'GOOGLE_PLACES_API_KEY': 'Restaurant scraping'
  };
  
  const optional = {
    'SENDGRID_API_KEY': 'Email automation (SendGrid backup)',
    'VAPI_API_KEY': 'WhatsApp outreach',
    'TELEGRAM_BOT_TOKEN': 'Telegram bot',
    'INSTAGRAM_ACCESS_TOKEN': 'Instagram outreach',
    'FACEBOOK_ACCESS_TOKEN': 'Facebook outreach',
    'LEONARDO_API_KEY': 'Image enhancement',
    'REPLICATE_API_TOKEN': 'Image enhancement backup'
  };
  
  let allRequired = true;
  
  log('\nRequired Keys:', 'yellow');
  for (const [key, description] of Object.entries(required)) {
    const isSet = !!process.env[key];
    if (isSet) {
      log(`   ✅ ${key} - ${description}`, 'green');
      results.passed.push(`API Key: ${key}`);
    } else {
      log(`   ❌ ${key} - ${description}`, 'red');
      results.failed.push(`Missing API Key: ${key}`);
      allRequired = false;
    }
  }
  
  log('\nOptional Keys:', 'yellow');
  for (const [key, description] of Object.entries(optional)) {
    const isSet = !!process.env[key];
    if (isSet) {
      log(`   ✅ ${key} - ${description}`, 'green');
    } else {
      log(`   ⚪ ${key} - ${description}`, 'reset');
      results.warnings.push(`Optional key not set: ${key}`);
    }
  }
  
  return allRequired;
}

async function testFileStructure() {
  logSection('📁 Testing File Structure');
  
  const requiredFiles = [
    'scripts/scrape-restaurants.js',
    'scripts/send-email.js',
    'scripts/multi-channel-outreach.js',
    'config/email-config.js',
    'lib/outreach-channels.js',
    'lib/outreach-orchestrator.js'
  ];
  
  const requiredDirs = [
    'data',
    'scripts',
    'config',
    'lib',
    'api'
  ];
  
  let allGood = true;
  
  log('\nRequired Directories:', 'yellow');
  for (const dir of requiredDirs) {
    const dirPath = path.join(__dirname, '..', dir);
    try {
      await fs.access(dirPath);
      log(`   ✅ ${dir}/`, 'green');
      results.passed.push(`Directory: ${dir}`);
    } catch {
      log(`   ❌ ${dir}/ - Missing!`, 'red');
      results.failed.push(`Missing directory: ${dir}`);
      allGood = false;
    }
  }
  
  log('\nRequired Files:', 'yellow');
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, '..', file);
    try {
      await fs.access(filePath);
      log(`   ✅ ${file}`, 'green');
      results.passed.push(`File: ${file}`);
    } catch {
      log(`   ❌ ${file} - Missing!`, 'red');
      results.failed.push(`Missing file: ${file}`);
      allGood = false;
    }
  }
  
  return allGood;
}

async function testDataDirectory() {
  logSection('💾 Testing Data Directory');
  
  const dataDir = path.join(__dirname, '..', 'data');
  
  try {
    await fs.mkdir(dataDir, { recursive: true });
    log('   ✅ Data directory exists/created', 'green');
    results.passed.push('Data directory');
  } catch (error) {
    log(`   ❌ Cannot create data directory: ${error.message}`, 'red');
    results.failed.push('Data directory creation');
    return false;
  }
  
  const dataFiles = [
    'qualified-leads.json',
    'all-leads.json',
    'sent-emails.json',
    'outreach-tracking.json'
  ];
  
  log('\nData Files:', 'yellow');
  for (const file of dataFiles) {
    const filePath = path.join(dataDir, file);
    try {
      await fs.access(filePath);
      const stats = await fs.stat(filePath);
      const content = await fs.readFile(filePath, 'utf8');
      const isEmpty = content.trim() === '' || content.trim() === '[]';
      log(`   ${isEmpty ? '⚪' : '✅'} ${file} ${isEmpty ? '(empty)' : `(${stats.size} bytes)`}`, isEmpty ? 'yellow' : 'green');
      if (!isEmpty) {
        results.passed.push(`Data file: ${file}`);
      }
    } catch {
      log(`   ⚪ ${file} - Not created yet`, 'yellow');
      results.warnings.push(`Data file not created: ${file}`);
    }
  }
  
  return true;
}

async function testModuleImports() {
  logSection('📦 Testing Module Imports');
  
  const modules = [
    { name: 'Email Config', path: '../config/email-config' },
    { name: 'Scrape Script', path: '../scripts/scrape-restaurants' },
    { name: 'Send Email Script', path: '../scripts/send-email' },
    { name: 'Multi-Channel Outreach', path: '../scripts/multi-channel-outreach' }
  ];
  
  let allGood = true;
  
  for (const module of modules) {
    try {
      require(module.path);
      log(`   ✅ ${module.name}`, 'green');
      results.passed.push(`Module: ${module.name}`);
    } catch (error) {
      log(`   ❌ ${module.name} - ${error.message}`, 'red');
      results.failed.push(`Module import: ${module.name} - ${error.message}`);
      allGood = false;
    }
  }
  
  return allGood;
}

async function testEmailConfig() {
  logSection('📧 Testing Email Configuration');
  
  try {
    const emailConfig = require('../config/email-config');
    
    const hasResend = !!process.env.RESEND_API_KEY;
    const hasSendGrid = !!process.env.SENDGRID_API_KEY;
    
    if (hasResend || hasSendGrid) {
      log('   ✅ Email service configured', 'green');
      log(`      Using: ${hasResend ? 'Resend' : 'SendGrid'}`, 'yellow');
      results.passed.push('Email configuration');
      return true;
    } else {
      log('   ❌ No email service configured', 'red');
      results.failed.push('Email service not configured');
      return false;
    }
  } catch (error) {
    log(`   ❌ Email config error: ${error.message}`, 'red');
    results.failed.push(`Email config: ${error.message}`);
    return false;
  }
}

async function testScrapingConfig() {
  logSection('🔍 Testing Scraping Configuration');
  
  const hasGooglePlaces = !!process.env.GOOGLE_PLACES_API_KEY;
  const hasYelp = !!process.env.YELP_API_KEY;
  const hasOutscraper = !!process.env.OUTSCRAPER_API_KEY;
  
  if (hasGooglePlaces || hasYelp || hasOutscraper) {
    log('   ✅ Scraping service configured', 'green');
    const services = [];
    if (hasGooglePlaces) services.push('Google Places');
    if (hasYelp) services.push('Yelp');
    if (hasOutscraper) services.push('Outscraper');
    log(`      Available: ${services.join(', ')}`, 'yellow');
    results.passed.push('Scraping configuration');
    return true;
  } else {
    log('   ❌ No scraping service configured', 'red');
    results.failed.push('Scraping service not configured');
    return false;
  }
}

async function testOutreachChannels() {
  logSection('📱 Testing Outreach Channels');
  
  const channels = {
    'Email (Resend)': !!process.env.RESEND_API_KEY,
    'Email (SendGrid)': !!process.env.SENDGRID_API_KEY,
    'WhatsApp (VAPI)': !!process.env.VAPI_API_KEY,
    'Telegram': !!process.env.TELEGRAM_BOT_TOKEN,
    'Instagram': !!process.env.INSTAGRAM_ACCESS_TOKEN,
    'Facebook': !!process.env.FACEBOOK_ACCESS_TOKEN
  };
  
  const available = Object.entries(channels).filter(([_, available]) => available);
  
  if (available.length > 0) {
    log('   ✅ Outreach channels configured', 'green');
    log(`      Available: ${available.map(([name]) => name).join(', ')}`, 'yellow');
    results.passed.push(`Outreach channels: ${available.length} configured`);
    return true;
  } else {
    log('   ❌ No outreach channels configured', 'red');
    results.failed.push('No outreach channels configured');
    return false;
  }
}

async function testScriptsExecutable() {
  logSection('⚙️  Testing Script Executability');
  
  const scripts = [
    { name: 'Scrape', command: 'npm run scrape --dry-run', file: 'scripts/scrape-restaurants.js' },
    { name: 'Send Email', command: 'npm run email:preview', file: 'scripts/send-email.js' },
    { name: 'Multi-Channel', command: 'npm run outreach:preview', file: 'scripts/multi-channel-outreach.js' }
  ];
  
  for (const script of scripts) {
    const filePath = path.join(__dirname, '..', script.file);
    try {
      await fs.access(filePath);
      // Check if file is readable and has content
      const content = await fs.readFile(filePath, 'utf8');
      if (content.length > 100) {
        log(`   ✅ ${script.name} - File exists and readable`, 'green');
        results.passed.push(`Script: ${script.name}`);
      } else {
        log(`   ⚠️  ${script.name} - File seems empty`, 'yellow');
        results.warnings.push(`Script may be empty: ${script.name}`);
      }
    } catch (error) {
      log(`   ❌ ${script.name} - ${error.message}`, 'red');
      results.failed.push(`Script: ${script.name} - ${error.message}`);
    }
  }
  
  return true;
}

function printSummary() {
  logSection('📊 Test Summary');
  
  const total = results.passed.length + results.failed.length;
  const passRate = total > 0 ? ((results.passed.length / total) * 100).toFixed(1) : 0;
  
  log(`\n✅ Passed: ${results.passed.length}`, 'green');
  log(`❌ Failed: ${results.failed.length}`, 'red');
  log(`⚠️  Warnings: ${results.warnings.length}`, 'yellow');
  log(`\nPass Rate: ${passRate}%`, passRate >= 80 ? 'green' : passRate >= 50 ? 'yellow' : 'red');
  
  if (results.failed.length > 0) {
    log('\n❌ Failed Tests:', 'red');
    results.failed.forEach(failure => log(`   - ${failure}`, 'red'));
  }
  
  if (results.warnings.length > 0) {
    log('\n⚠️  Warnings:', 'yellow');
    results.warnings.forEach(warning => log(`   - ${warning}`, 'yellow'));
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (results.failed.length === 0) {
    log('\n🎉 All critical tests passed!', 'green');
    log('Your automation system is ready to use.\n', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please fix the issues above.\n', 'yellow');
  }
}

async function main() {
  log('\n🧪 MagicPlate Automation Test Suite\n', 'cyan');
  log('Testing all automation systems...\n', 'yellow');
  
  await testAPIKeys();
  await testFileStructure();
  await testDataDirectory();
  await testModuleImports();
  await testEmailConfig();
  await testScrapingConfig();
  await testOutreachChannels();
  await testScriptsExecutable();
  
  printSummary();
  
  // Exit with error code if critical tests failed
  process.exit(results.failed.length > 0 ? 1 : 0);
}

main().catch(error => {
  log(`\n❌ Test suite error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
