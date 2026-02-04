require('dotenv').config();
const { sendEmail, emailTemplates, getEmailService } = require('../config/email-config');
const fs = require('fs').promises;
const path = require('path');

const TRACKING_FILE = path.join(__dirname, '..', 'data', 'sent-emails.json');

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
    sentAt: new Date().toISOString()
  });
  tracking.stats.total++;
  if (emailData.success) {
    tracking.stats.successful++;
  } else {
    tracking.stats.failed++;
  }
  await fs.writeFile(TRACKING_FILE, JSON.stringify(tracking, null, 2));
}

async function sendOutreachEmail(restaurant) {
  const emailsToTry = restaurant.email 
    ? [restaurant.email, ...(restaurant.potentialEmails || [])]
    : restaurant.potentialEmails || [];
  
  if (emailsToTry.length === 0) {
    await saveSentEmail({
      restaurant: restaurant.name,
      email: null,
      success: false,
      reason: 'no_email'
    });
    return { success: false, reason: 'no_email' };
  }
  
  for (const email of emailsToTry) {
    try {
      const emailData = emailTemplates.initialOutreach({
        ...restaurant,
        email: email
      });
      
      await sendEmail(emailData);
      
      await saveSentEmail({
        restaurant: restaurant.name,
        email: email,
        success: true,
        score: restaurant.qualificationScore,
        issues: restaurant.issues
      });
      
      console.log(`✅ ${restaurant.name} → ${email} (Score: ${restaurant.qualificationScore})`);
      return { success: true, email: email };
      
    } catch (error) {
      const errorMessage = error.error?.message || error.message || 'Unknown error';
      const errorDetails = error.error?.response?.body || error.response?.body;
      
      // Check for email validation errors
      if (errorMessage.includes('does not exist') || 
          errorMessage.includes('invalid') || 
          errorDetails?.errors?.[0]?.message?.includes('does not exist')) {
        continue; // Try next email
      }
      
      await saveSentEmail({
        restaurant: restaurant.name,
        email: email,
        success: false,
        reason: errorMessage
      });
      
      return { success: false, reason: errorMessage };
    }
  }
  
  return { success: false, reason: 'all_emails_failed' };
}

async function sendBatchEmails(leads, options = {}) {
  const { batchSize = 10, delay = 2000, maxEmails = null, dryRun = false } = options;
  
  const emailsToSend = leads
    .filter(lead => (lead.email || lead.potentialEmails?.length > 0) && lead.status !== 'emailed')
    .slice(0, maxEmails || leads.length);
  
  if (dryRun) {
    console.log(`\n🧪 DRY RUN - Would send to ${emailsToSend.length} restaurants:\n`);
    emailsToSend.forEach((lead, i) => {
      console.log(`${i + 1}. ${lead.name}`);
      console.log(`   Email: ${lead.email || lead.potentialEmails?.[0] || 'None'}`);
      console.log(`   Score: ${lead.qualificationScore} | Issues: ${lead.issues?.join(', ')}\n`);
    });
    return { sent: 0, failed: 0 };
  }
  
  console.log(`\n📧 Sending to ${emailsToSend.length} restaurants...\n`);
  
  let sent = 0, failed = 0;
  
  for (let i = 0; i < emailsToSend.length; i += batchSize) {
    const batch = emailsToSend.slice(i, i + batchSize);
    
    const results = await Promise.allSettled(
      batch.map(lead => sendOutreachEmail(lead))
    );
    
    results.forEach((result, idx) => {
      const lead = batch[idx];
      if (result.status === 'fulfilled' && result.value.success) {
        lead.status = 'emailed';
        lead.emailedAt = new Date().toISOString();
        lead.emailUsed = result.value.email;
        sent++;
      } else {
        failed++;
      }
    });
    
    // Save progress
    const filePath = path.join(__dirname, '..', 'data', 'qualified-leads.json');
    await fs.writeFile(filePath, JSON.stringify(leads, null, 2));
    
    if (i + batchSize < emailsToSend.length) {
      console.log(`⏳ Sent ${i + batchSize}/${emailsToSend.length}... Waiting ${delay}ms\n`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return { sent, failed };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const maxEmails = args.find(arg => arg.startsWith('--max='))?.split('=')[1];
  
  if (!process.env.RESEND_API_KEY && !process.env.SENDGRID_API_KEY) {
    console.error('❌ No email service configured. Set RESEND_API_KEY or SENDGRID_API_KEY in .env');
    process.exit(1);
  }
  
  console.log(`📧 Using email service: ${getEmailService()}\n`);
  
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
  
  const stats = await sendBatchEmails(leads, {
    batchSize: 10,
    delay: 2000,
    maxEmails: maxEmails ? parseInt(maxEmails) : null,
    dryRun
  });
  
  // Final summary
  const tracking = await loadSentEmails();
  
  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 CAMPAIGN SUMMARY');
  console.log(`${'='.repeat(50)}`);
  console.log(`✅ Sent: ${stats.sent}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log(`\n📈 TOTAL STATS (All Time):`);
  console.log(`   Total Emails: ${tracking.stats.total}`);
  console.log(`   Successful: ${tracking.stats.successful}`);
  console.log(`   Failed: ${tracking.stats.failed}`);
  if (tracking.stats.total > 0) {
    const successRate = ((tracking.stats.successful / tracking.stats.total) * 100).toFixed(1);
    console.log(`   Success Rate: ${successRate}%`);
  }
  console.log(`${'='.repeat(50)}\n`);
  
  if (!dryRun) {
    console.log('💾 Tracking saved to: data/sent-emails.json');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { sendOutreachEmail, sendBatchEmails };
