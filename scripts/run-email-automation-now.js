require('dotenv').config();
const axios = require('axios');

async function runAutomation() {
  const url = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}/api/run-automation`
    : 'http://localhost:3000/api/run-automation';
  
  console.log(`🚀 Triggering automation at: ${url}\n`);
  
  try {
    const response = await axios.get(url, {
      timeout: 60000 // 60 seconds
    });
    
    console.log('✅ Automation completed!');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Error:', error.message);
      console.log('\n💡 To run locally instead:');
      console.log('   node scripts/scrape-restaurants.js');
      console.log('   node scripts/send-email.js');
    }
  }
}

runAutomation();
