require('dotenv').config();
const { sendEmail } = require('../config/email-config');

async function testResend() {
  console.log('🧪 Testing Resend email sending...\n');
  
  // Test email to yourself
  const testEmail = process.env.FROM_EMAIL || 'sydney@magicplate.info';
  
  try {
    const result = await sendEmail({
      to: testEmail,
      from: {
        email: process.env.FROM_EMAIL || 'sydney@magicplate.info',
        name: process.env.FROM_NAME || 'Sydney - MagicPlate'
      },
      subject: '✅ Resend Test - MagicPlate Setup',
      html: `
        <h2>Resend is working! 🎉</h2>
        <p>If you received this email, your Resend setup is complete.</p>
        <p>You can now send outreach emails to restaurants.</p>
      `,
      text: 'Resend is working! If you received this email, your Resend setup is complete.'
    });
    
    console.log('✅ Email sent successfully!');
    console.log('📧 Check your inbox:', testEmail);
    console.log('📊 Service used:', result.service);
    console.log('\n🎯 Next steps:');
    console.log('   1. Verify your domain in Resend (if not done yet)');
    console.log('   2. Run: npm run email:test (to send to test leads)');
    console.log('   3. Run: npm run email (to send to all qualified leads)');
    
  } catch (error) {
    console.error('❌ Error sending email:');
    console.error(error);
    
    if (error.error?.message) {
      console.error('\n💡 Common issues:');
      if (error.error.message.includes('domain')) {
        console.error('   - Domain not verified in Resend');
        console.error('   - Go to https://resend.com/domains and verify magicplate.info');
      }
      if (error.error.message.includes('API key')) {
        console.error('   - Invalid API key');
        console.error('   - Check your RESEND_API_KEY in .env');
      }
    }
  }
}

testResend();
