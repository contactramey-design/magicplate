require('dotenv').config();
const { scrapeAndQualifyLeads } = require('../scripts/scrape-restaurants');
const fs = require('fs').promises;
const path = require('path');

// Reuse the sendBatchEmails function from send-email.js
// We'll import it dynamically to avoid circular dependencies
async function sendBatchEmails(leads, options = {}) {
  // Import the actual function - need to require the module
  const sendEmailModule = require('../scripts/send-email');
  
  // The send-email.js exports main() but we need sendBatchEmails
  // Let's create a wrapper that uses the existing logic
  const { sendEmail, emailTemplates } = require('../config/email-config');
  const { batchSize = 5, delay = 2000, maxEmails = null } = options;
  
  const TRACKING_FILE = path.join(process.cwd(), 'data', 'sent-emails.json');
  
  async function loadSentEmails() {
    try {
      const data = await fs.readFile(TRACKING_FILE, 'utf8');
      return JSON.parse(data);
    } catch {
      return { sent: [], stats: { total: 0, successful: 0, failed: 0 } };
    }
  }
  
  async function saveSentEmail(emailData) {
    const tracking = await loadSentEmails();
    tracking.sent.push({
      ...emailData,
      timestamp: new Date().toISOString()
    });
    tracking.stats.total++;
    if (emailData.success) {
      tracking.stats.successful++;
    } else {
      tracking.stats.failed++;
    }
    await fs.mkdir(path.dirname(TRACKING_FILE), { recursive: true });
    await fs.writeFile(TRACKING_FILE, JSON.stringify(tracking, null, 2));
  }
  
  const emailsToSend = maxEmails ? leads.slice(0, maxEmails) : leads;
  const sent = [];
  const failed = [];
  
  for (let i = 0; i < emailsToSend.length; i += batchSize) {
    const batch = emailsToSend.slice(i, i + batchSize);
    
    for (const lead of batch) {
      const email = lead.email || lead.potentialEmails?.[0];
      if (!email) {
        await saveSentEmail({
          restaurant: lead.name,
          email: null,
          success: false,
          reason: 'no_email'
        });
        failed.push({ lead: lead.name, reason: 'no_email' });
        continue;
      }
      
      try {
        const emailData = emailTemplates.initialOutreach({
          ...lead,
          email: email
        });
        
        await sendEmail(emailData);
        
        await saveSentEmail({
          restaurant: lead.name,
          email: email,
          success: true,
          score: lead.qualificationScore,
          issues: lead.issues
        });
        
        sent.push({ restaurant: lead.name, email: email });
      } catch (error) {
        const errorMessage = error.error?.message || error.message || 'Unknown error';
        await saveSentEmail({
          restaurant: lead.name,
          email: email,
          success: false,
          reason: errorMessage
        });
        failed.push({ lead: lead.name, reason: errorMessage });
      }
    }
    
    // Delay between batches
    if (i + batchSize < emailsToSend.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return { sent, failed };
}

module.exports = async (req, res) => {
  // Only allow POST requests (or GET for testing)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const startTime = Date.now();
  
  try {
    console.log('🤖 Starting automation...');
    
    // 1. Scrape leads
    const area = process.env.SEARCH_AREA || 'Kansas City, MO';
    const sources = [];
    if (process.env.GOOGLE_PLACES_API_KEY) sources.push('googleMaps');
    if (process.env.YELP_API_KEY) sources.push('yelp');
    if (process.env.OUTSCRAPER_API_KEY) sources.push('outscraper');
    
    if (sources.length === 0) {
      return res.status(500).json({
        error: 'No API keys configured',
        message: 'Set at least one: GOOGLE_PLACES_API_KEY, YELP_API_KEY, or OUTSCRAPER_API_KEY'
      });
    }
    
    console.log(`📍 Scraping area: ${area}`);
    console.log(`📡 Using sources: ${sources.join(', ')}`);
    
    const results = await scrapeAndQualifyLeads(area, sources, {
      excludeDoordash: process.env.EXCLUDE_DOORDASH === 'true',
      targetIndependent: process.env.TARGET_INDEPENDENT !== 'false',
      radius: parseInt(process.env.SEARCH_RADIUS) || 10
    });
    
    console.log(`✅ Scraped ${results.all.length} total leads`);
    console.log(`✨ Found ${results.qualified.length} qualified leads`);
    
    // 2. Filter leads with emails
    const qualifiedLeads = results.qualified.filter(l => l.email || l.potentialEmails?.[0]);
    console.log(`📧 ${qualifiedLeads.length} qualified leads have emails`);
    
    // 3. Send emails with daily limit (respect Vercel's 60s timeout)
    const dailyLimit = parseInt(process.env.MAX_EMAILS_PER_DAY) || 30; // Conservative limit
    const leadsToEmail = qualifiedLeads.slice(0, dailyLimit);
    
    console.log(`📨 Sending emails to ${leadsToEmail.length} leads (limit: ${dailyLimit})`);
    
    const emailResults = await sendBatchEmails(leadsToEmail, {
      batchSize: 5, // Smaller batches for serverless
      delay: 2000,
      maxEmails: dailyLimit
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      scraping: {
        area: area,
        sources: sources,
        totalLeads: results.all.length,
        qualifiedLeads: results.qualified.length,
        leadsWithEmails: qualifiedLeads.length
      },
      emailing: {
        attempted: leadsToEmail.length,
        successful: emailResults.sent.length,
        failed: emailResults.failed.length,
        dailyLimit: dailyLimit
      }
    };
    
    console.log(`✅ Automation complete in ${duration}s`);
    console.log(`📊 Results:`, JSON.stringify(response, null, 2));
    
    res.status(200).json(response);
    
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error('❌ Automation error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      duration: `${duration}s`,
      timestamp: new Date().toISOString()
    });
  }
};
