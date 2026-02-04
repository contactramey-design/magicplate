const fs = require('fs').promises;
const path = require('path');

async function trackResponses() {
  const trackingPath = path.join(__dirname, '..', 'data', 'sent-emails.json');
  
  try {
    const data = await fs.readFile(trackingPath, 'utf8');
    const tracking = JSON.parse(data);
    
    console.log('\n📊 OUTREACH TRACKING\n');
    console.log(`${'='.repeat(60)}`);
    console.log(`Total Emails Sent: ${tracking.stats.total}`);
    console.log(`✅ Successful: ${tracking.stats.successful}`);
    console.log(`❌ Failed: ${tracking.stats.failed}`);
    if (tracking.stats.total > 0) {
      const successRate = ((tracking.stats.successful / tracking.stats.total) * 100).toFixed(1);
      console.log(`Success Rate: ${successRate}%`);
    }
    console.log(`${'='.repeat(60)}\n`);
    
    if (tracking.sent.length > 0) {
      console.log('📧 Recent Emails Sent:\n');
      tracking.sent.slice(-20).reverse().forEach((email, i) => {
        const status = email.success ? '✅' : '❌';
        console.log(`${i + 1}. ${status} ${email.restaurant}`);
        console.log(`   ${email.email || 'No email'} | Score: ${email.score || 'N/A'}`);
        if (!email.success) {
          console.log(`   Reason: ${email.reason}`);
        }
        console.log('');
      });
      
      // Calculate potential customers
      const successful = tracking.sent.filter(e => e.success).length;
      console.log(`\n💡 ${successful} restaurants received your email`);
      console.log(`   Even 1% response = ${Math.ceil(successful * 0.01)} potential customers`);
      console.log(`   5% response = ${Math.ceil(successful * 0.05)} potential customers`);
      console.log(`   10% response = ${Math.ceil(successful * 0.10)} potential customers\n`);
    } else {
      console.log('No emails sent yet. Run: npm run email\n');
    }
    
  } catch (error) {
    console.log('❌ No tracking data found. Send some emails first!');
    console.log('💡 Run: npm run email:test (sends to 5) or npm run email (sends all)\n');
  }
}

if (require.main === module) {
  trackResponses().catch(console.error);
}

module.exports = { trackResponses };
