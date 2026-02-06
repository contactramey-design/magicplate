/**
 * OpenClaw Skills Index for MagicPlate
 * Exports all MagicPlate-specific skills for OpenClaw
 */

const email = require('./magicplate-email');
const scraping = require('./magicplate-scraping');
const outreach = require('./magicplate-outreach');

module.exports = {
  email,
  scraping,
  outreach,
  
  // Convenience functions
  async scrapeRestaurants(area, limit = 100) {
    return await scraping.scrapeAndSave(area, limit);
  },
  
  async sendEmails(maxEmails = null, dryRun = false) {
    return await email.sendBatchEmails(maxEmails, dryRun);
  },
  
  async sendOutreach(maxContacts = null, channels = ['email', 'whatsapp']) {
    return await outreach.batchOutreach(maxContacts, channels);
  },
  
  async dailyAutomation() {
    console.log('🤖 Starting daily MagicPlate automation...');
    
    // 1. Scrape new restaurants
    const area = process.env.SEARCH_AREA || 'Los Angeles, CA';
    const scrapeResult = await scraping.scrapeAndSave(area, 100);
    console.log(`✅ Scraped ${scrapeResult.qualified} qualified leads`);
    
    // 2. Send emails to qualified leads
    const emailResult = await email.sendBatchEmails(20, false);
    console.log(`✅ Sent ${emailResult.sent} emails`);
    
    // 3. Multi-channel outreach for restaurants without emails
    const outreachResult = await outreach.batchOutreach(10, ['whatsapp']);
    console.log(`✅ Contacted ${outreachResult.contacted} via WhatsApp`);
    
    return {
      scraping: scrapeResult,
      emails: emailResult,
      outreach: outreachResult
    };
  }
};
