require('dotenv').config();

// Support both SendGrid and Resend
let sgMail = null;
let resend = null;

if (process.env.SENDGRID_API_KEY) {
  sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

if (process.env.RESEND_API_KEY) {
  const Resend = require('resend');
  resend = Resend;
}

// Determine which email service to use (Resend takes priority if both are set)
const useResend = !!process.env.RESEND_API_KEY;
const useSendGrid = !!process.env.SENDGRID_API_KEY && !useResend;

const emailTemplates = {
  initialOutreach: (restaurant) => {
    // Personalize based on their issues
    const issues = restaurant.issues || [];
    let personalizedHook = '';
    
    if (issues.includes('not_on_doordash')) {
      personalizedHook = 'We noticed you\'re not on DoorDash yet—this is a huge opportunity to unlock 20-40% more revenue from delivery customers.';
    } else if (issues.includes('no_website') || issues.includes('broken_website')) {
      personalizedHook = 'We noticed your restaurant could benefit from a stronger online presence—especially a shareable digital menu that customers can access anywhere.';
    } else if (issues.includes('no_menu_photos') || issues.includes('no_professional_photos')) {
      personalizedHook = 'Your menu items deserve to look as amazing as they taste. We can transform your current photos into stunning visuals that drive orders.';
    } else {
      personalizedHook = 'We help restaurants like yours transform their menu presentation and digital presence to drive more sales.';
    }
    
    const fromEmail = process.env.FROM_EMAIL || 'sydney@magicplate.info';
    const fromName = process.env.FROM_NAME || 'Sydney Ramey - MagicPlate.ai';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 32px; font-weight: 700; }
          .header .tagline { margin: 10px 0 0 0; font-size: 16px; opacity: 0.95; }
          .content { padding: 40px 30px; background: #f9f9f9; }
          .intro { background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea; }
          .section { background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; }
          .section h2 { color: #667eea; margin-top: 0; font-size: 22px; }
          .benefits { list-style: none; padding: 0; margin: 0; }
          .benefits li { padding: 12px 0; border-bottom: 1px solid #f0f0f0; position: relative; padding-left: 30px; }
          .benefits li:last-child { border-bottom: none; }
          .benefits li:before { content: "✨ "; position: absolute; left: 0; color: #667eea; font-weight: bold; }
          .pricing { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 25px; border-radius: 8px; text-align: center; margin: 25px 0; }
          .pricing .price { font-size: 36px; font-weight: 700; margin: 10px 0; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; text-align: center; }
          .cta-button:hover { background: #5568d3; }
          .footer { padding: 30px; text-align: center; background: #2d3748; color: #a0aec0; font-size: 14px; }
          .footer a { color: #667eea; text-decoration: none; }
          .highlight { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MagicPlate.ai</h1>
            <p class="tagline">Make Every Plate Magical ✨</p>
          </div>
          
          <div class="content">
            <div class="intro">
              <p><strong>Hi there!</strong></p>
              <p>My name is Sydney, and I'm reaching out from <strong>MagicPlate.ai</strong>. ${personalizedHook}</p>
            </div>
            
            <div class="section">
              <h2>What We Do</h2>
              <p>We specialize in <strong>AI-powered menu restoration and digital menu creation</strong> – transforming your real plate photos into stunning visuals that captivate customers and drive sales.</p>
              
              <ul class="benefits">
                <li><strong>AI Menu Restoration:</strong> We enhance your real photos with AI magic – sharpening details, boosting colors, perfect lighting – all true to your originals (no fakes!)</li>
                <li><strong>Digital Magic Menu:</strong> Create a sleek, shareable digital menu with your custom link (e.g., yourrestaurant.magicplate.info/menu) – perfect for QR codes, social media, and in-store displays</li>
                <li><strong>Interactive Features:</strong> Zoomable photos, AI descriptions, diet filters, search functionality, and effortless updates for specials</li>
                <li><strong>DoorDash Optimization:</strong> Get your enhanced photos and descriptions synced to DoorDash for standout visibility ($99 add-on, or $50 when bundled)</li>
              </ul>
            </div>
            
            <div class="highlight">
              <p><strong>💰 The Results:</strong> Clients typically see a <strong>20-40% increase in average order values</strong> and <strong>20-40% boost in delivery revenue</strong> after our menu transformation. Plus, you'll save 80% compared to traditional design firms.</p>
            </div>
            
            <div class="pricing">
              <p style="margin: 0; font-size: 18px;">Starting at</p>
              <div class="price">$299</div>
              <p style="margin: 0;">Get your magical digital menu in 48 hours</p>
            </div>
            
            <div style="text-align: center;">
              <a href="https://magicplate.info/book" class="cta-button">Schedule a Free 15-Minute Call</a>
            </div>
            
            <div class="section">
              <p><strong>Our Magic Formula:</strong></p>
              <p>Gather Real Plates → Apply AI Enhancements → Launch Digital Magic → Watch Business Flourish</p>
              <p>Ready to see how a professional digital menu can significantly grow your business? Let's schedule a brief 15-minute Zoom call this week, and I can show you examples tailored to your menu!</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 0;"><strong>Book your call:</strong></p>
              <p style="margin: 5px 0;">📧 Reply to this email</p>
              <p style="margin: 5px 0;">📞 Call or text: (805) 668-9973</p>
              <p style="margin: 5px 0;">🌐 Visit: <a href="https://magicplate.info/book">magicplate.info/book</a></p>
            </div>
            
            <p style="margin-top: 30px;">Looking forward to connecting!</p>
            
            <p style="margin: 20px 0 0 0;">
              Best,<br>
              <strong>Sydney Ramey</strong><br>
              <em>MagicPlate.ai</em><br>
              <a href="mailto:contact@magicplate.info">contact@magicplate.info</a> | (805) 668-9973<br>
              <a href="https://instagram.com/rameyservices">Instagram: @Rameyservices</a>
            </p>
          </div>
          
          <div class="footer">
            <p>MagicPlate.ai - Where every plate becomes a masterpiece</p>
            <p><a href="https://magicplate.info">Visit our website</a> | <a href="mailto:contact@magicplate.info">Contact us</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const text = `
Hi there!

My name is Sydney, and I'm reaching out from MagicPlate.ai. ${personalizedHook}

WHAT WE DO:
We specialize in AI-powered menu restoration and digital menu creation – transforming your real plate photos into stunning visuals that captivate customers and drive sales.

✨ AI Menu Restoration: We enhance your real photos with AI magic – sharpening details, boosting colors, perfect lighting – all true to your originals (no fakes!)

✨ Digital Magic Menu: Create a sleek, shareable digital menu with your custom link (e.g., yourrestaurant.magicplate.info/menu) – perfect for QR codes, social media, and in-store displays

✨ Interactive Features: Zoomable photos, AI descriptions, diet filters, search functionality, and effortless updates for specials

✨ DoorDash Optimization: Get your enhanced photos and descriptions synced to DoorDash for standout visibility ($99 add-on, or $50 when bundled)

💰 THE RESULTS:
Clients typically see a 20-40% increase in average order values and 20-40% boost in delivery revenue after our menu transformation. Plus, you'll save 80% compared to traditional design firms.

PRICING:
Starting at $299 - Get your magical digital menu in 48 hours

Book your call:
📧 Reply to this email
📞 Call or text: (805) 668-9973
🌐 Visit: https://magicplate.info/book

Our Magic Formula:
Gather Real Plates → Apply AI Enhancements → Launch Digital Magic → Watch Business Flourish

Ready to see how a professional digital menu can significantly grow your business? Let's schedule a brief 15-minute Zoom call this week, and I can show you examples tailored to your menu!

Looking forward to connecting!

Best,
Sydney Ramey
MagicPlate.ai
contact@magicplate.info | (805) 668-9973
Instagram: @Rameyservices

---
MagicPlate.ai - Where every plate becomes a masterpiece
Visit: https://magicplate.info
    `;
    
    return {
      to: restaurant.email || restaurant.potentialEmails?.[0],
      from: {
        email: fromEmail,
        name: fromName
      },
      subject: `Elevate Your Menu, Boost Revenue & Outshine the Competition`,
      html: html,
      text: text
    };
  }
};

// Email sending function that works with both services
async function sendEmail(emailData) {
  if (useResend && resend) {
    const resendClient = new resend(process.env.RESEND_API_KEY);
    
    try {
      const result = await resendClient.emails.send({
        from: `${emailData.from.name} <${emailData.from.email}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      });
      
      return { success: true, result, service: 'resend' };
    } catch (error) {
      throw { error: error, service: 'resend' };
    }
  } else if (useSendGrid && sgMail) {
    try {
      await sgMail.send({
        to: emailData.to,
        from: {
          email: emailData.from.email,
          name: emailData.from.name
        },
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      });
      
      return { success: true, service: 'sendgrid' };
    } catch (error) {
      throw { error, service: 'sendgrid' };
    }
  } else {
    throw new Error('No email service configured. Set RESEND_API_KEY or SENDGRID_API_KEY in .env');
  }
}

module.exports = { 
  emailTemplates, 
  sendEmail,
  useResend,
  useSendGrid,
  getEmailService: () => useResend ? 'Resend' : (useSendGrid ? 'SendGrid' : 'None')
};
