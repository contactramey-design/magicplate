#!/usr/bin/env node
/**
 * OpenClaw Integration Script for MagicPlate
 * Provides CLI interface to OpenClaw skills
 */

require('dotenv').config();
const skills = require('../openclaw-skills');

const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  console.log('🦞 MagicPlate OpenClaw Integration\n');

  switch (command) {
    case 'scrape':
      const area = args[0] || process.env.SEARCH_AREA || 'Los Angeles, CA';
      const limit = parseInt(args[1]) || 100;
      console.log(`🔍 Scraping restaurants in ${area}...`);
      const scrapeResult = await skills.scrapeRestaurants(area, limit);
      console.log(`✅ Scraped ${scrapeResult.qualified} qualified leads`);
      console.log(`📊 Total leads: ${scrapeResult.allLeads}`);
      break;

    case 'email':
      const maxEmails = args[0] ? parseInt(args[0]) : null;
      const dryRun = args.includes('--dry-run') || args.includes('-d');
      console.log(`📧 Sending emails${dryRun ? ' (dry run)' : ''}...`);
      const emailResult = await skills.sendEmails(maxEmails, dryRun);
      console.log(`✅ Sent ${emailResult.sent} emails`);
      if (emailResult.failed > 0) {
        console.log(`❌ Failed: ${emailResult.failed}`);
      }
      break;

    case 'outreach':
      const maxContacts = args[0] ? parseInt(args[0]) : null;
      const channels = args.includes('--whatsapp') 
        ? ['whatsapp'] 
        : args.includes('--email')
        ? ['email']
        : ['email', 'whatsapp'];
      console.log(`📱 Sending outreach via ${channels.join(', ')}...`);
      const outreachResult = await skills.sendOutreach(maxContacts, channels);
      console.log(`✅ Contacted ${outreachResult.contacted} restaurants`);
      if (outreachResult.failed > 0) {
        console.log(`❌ Failed: ${outreachResult.failed}`);
      }
      break;

    case 'daily':
      console.log('🤖 Running daily automation...');
      const dailyResult = await skills.dailyAutomation();
      console.log('\n✅ Daily automation complete!');
      console.log(`   Scraped: ${dailyResult.scraping.qualified} qualified`);
      console.log(`   Emails: ${dailyResult.emails.sent} sent`);
      console.log(`   Outreach: ${dailyResult.outreach.contacted} contacted`);
      break;

    case 'help':
    default:
      console.log('Usage: node scripts/openclaw-integration.js <command> [args]\n');
      console.log('Commands:');
      console.log('  scrape [area] [limit]     - Scrape restaurants');
      console.log('  email [max] [--dry-run]   - Send emails to leads');
      console.log('  outreach [max] [--whatsapp|--email] - Multi-channel outreach');
      console.log('  daily                      - Run daily automation');
      console.log('  help                       - Show this help\n');
      console.log('Examples:');
      console.log('  node scripts/openclaw-integration.js scrape "Kansas City, MO" 50');
      console.log('  node scripts/openclaw-integration.js email 10');
      console.log('  node scripts/openclaw-integration.js outreach 5 --whatsapp');
      console.log('  node scripts/openclaw-integration.js daily');
      break;
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
