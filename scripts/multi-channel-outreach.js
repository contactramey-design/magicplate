#!/usr/bin/env node
/**
 * Multi-Channel Outreach Script
 * Sends outreach via Email, Instagram, Facebook, WhatsApp, and Voicemail
 */

require('dotenv').config();
const { batchOutreach, getOutreachStats } = require('../lib/outreach-orchestrator');
const fs = require('fs').promises;
const path = require('path');

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const maxContacts = args.find(arg => arg.startsWith('--max='))?.split('=')[1];
  const channels = args.find(arg => arg.startsWith('--channels='))?.split('=')[1]?.split(',');
  const skipChannels = args.find(arg => arg.startsWith('--skip='))?.split('=')[1]?.split(',') || [];
  
  console.log('🚀 MagicPlate Multi-Channel Outreach\n');
  
  // Check required APIs
  const hasEmail = !!(process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY);
  const hasInstagram = !!process.env.INSTAGRAM_ACCESS_TOKEN;
  const hasFacebook = !!process.env.FACEBOOK_ACCESS_TOKEN;
  const hasVapi = !!process.env.VAPI_API_KEY;
  const hasZappy = !!process.env.ZAPPY_API_KEY; // Backward compatibility
  const hasWhatsApp = hasVapi || hasZappy;
  
  console.log('📡 Available Channels:');
  console.log(`   Email: ${hasEmail ? '✅' : '❌'}`);
  console.log(`   Instagram: ${hasInstagram ? '✅' : '❌'}`);
  console.log(`   Facebook: ${hasFacebook ? '✅' : '❌'}`);
  console.log(`   WhatsApp/Voicemail (VAPI): ${hasWhatsApp ? '✅' : '❌'}\n`);
  
  if (!hasEmail && !hasInstagram && !hasFacebook && !hasWhatsApp) {
    console.error('❌ No outreach channels configured!');
    console.error('   Set at least one: RESEND_API_KEY, INSTAGRAM_ACCESS_TOKEN, FACEBOOK_ACCESS_TOKEN, or VAPI_API_KEY');
    process.exit(1);
  }
  
  // Load qualified leads
  const leadsPath = path.join(__dirname, '..', 'data', 'qualified-leads.json');
  let leads = [];
  
  try {
    const data = await fs.readFile(leadsPath, 'utf8');
    leads = JSON.parse(data);
  } catch {
    console.log('❌ No qualified leads found. Run: npm run scrape');
    return;
  }
  
  if (leads.length === 0) {
    console.log('❌ No qualified leads. Run: npm run scrape');
    return;
  }
  
  console.log(`📊 Loaded ${leads.length} qualified leads\n`);
  
  // Run outreach
  const stats = await batchOutreach(leads, {
    batchSize: 5,
    delay: 3000,
    maxRestaurants: maxContacts ? parseInt(maxContacts) : null,
    dryRun,
    preferredChannels: channels,
    skipChannels
  });
  
  // Show summary
  const trackingStats = await getOutreachStats();
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 OUTREACH SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Contacted: ${stats.contacted}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log(`\n📈 TOTAL STATS (All Time):`);
  console.log(`   Total Attempts: ${trackingStats.total}`);
  console.log(`   Successful: ${trackingStats.successful}`);
  console.log(`   Failed: ${trackingStats.failed}`);
  if (trackingStats.total > 0) {
    const successRate = ((trackingStats.successful / trackingStats.total) * 100).toFixed(1);
    console.log(`   Success Rate: ${successRate}%`);
  }
  console.log(`\n📱 By Channel:`);
  Object.entries(trackingStats.by_channel).forEach(([channel, stats]) => {
    if (stats.sent > 0 || stats.failed > 0) {
      console.log(`   ${channel}: ${stats.sent} sent, ${stats.failed} failed`);
    }
  });
  console.log(`${'='.repeat(60)}\n`);
  
  if (!dryRun) {
    console.log('💾 Tracking saved to: data/outreach-tracking.json');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
