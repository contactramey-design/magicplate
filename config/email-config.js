require('dotenv').config();

// Support both SendGrid and Resend
let sgMail = null;
let resend = null;

if (process.env.SENDGRID_API_KEY) {
  sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

if (process.env.RESEND_API_KEY) {
  const { Resend } = require('resend');
  resend = new Resend(process.env.RESEND_API_KEY);
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
    } else if (issues.includes('outdated_website') || issues.includes('outdated_menu')) {
      personalizedHook = 'We noticed your menu could use a refresh—transforming outdated menus into stunning, modern designs that captivate customers and drive sales.';
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
              <p>My name is Sydney, and I'm reaching out from <strong>MagicPlate.ai</strong>. We specialize in food menu restoration – transforming outdated menus into stunning, modern designs that captivate customers and drive sales.</p>
            </div>
            
            <div class="section">
              <h2>The Challenge</h2>
              <p>We know the challenges: constantly hiring expensive photographers for new dishes, or struggling to make new items look great. A tired menu can silently erode your profits and make it harder to compete with the sleek, high-tech visuals seen elsewhere.</p>
              <p>Our service gives your restaurant that <strong>"big city" visual appeal and professionalism</strong>, ensuring every dish looks irresistible and future updates are simple and cost-effective.</p>
            </div>
            
            <div class="highlight">
              <p><strong>💰 The Results:</strong> Clients often see a <strong>20-30% increase in average order values</strong> after our menu revitalization.</p>
            </div>
            
            <div class="section">
              <h2>DoorDash Onboarding</h2>
              <p>Additionally, for just <strong>$100 ($50 when bundled with menu restoration)</strong>, we offer seamless DoorDash onboarding. We handle the setup, menu integration, and best practices to get you live quickly.</p>
              <p>This unlocks new delivery customers, <strong>boosting off-peak revenue by 20-40% on average</strong>, and expands your reach effortlessly.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 18px; margin-bottom: 20px;"><strong>Ready to see how a professional menu and optimized delivery presence can significantly grow your business?</strong></p>
              <p style="margin-bottom: 20px;">Let's schedule a brief 15-minute Zoom call this week to explore your menu's potential and I can show you a few options from your menu!</p>
              <div style="margin: 25px 0;">
                <a href="https://magicplate.info" class="cta-button" style="display: inline-block; background: #667eea; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0;">Visit MagicPlate.ai</a>
              </div>
            </div>
            
            <div class="section">
              <h2>Learn More</h2>
              <p style="margin-bottom: 15px;"><strong>Visit our website:</strong></p>
              <p style="margin-bottom: 25px;"><a href="https://magicplate.info" style="color: #667eea; text-decoration: none; font-size: 18px; font-weight: 600;">https://magicplate.info</a></p>
              
              <p style="margin-bottom: 10px;"><strong>Watch our short welcome video:</strong></p>
              <p style="margin-bottom: 20px;"><a href="https://app.heygen.com/videos/11388ae023ba4fde9a6859dc46435cb3" style="color: #667eea; text-decoration: none;">https://app.heygen.com/videos/11388ae023ba4fde9a6859dc46435cb3</a></p>
              
              <p style="margin-bottom: 10px;"><strong>View examples of our work and packages:</strong></p>
              <ul style="list-style: none; padding: 0; margin: 0 0 20px 0;">
                <li style="margin-bottom: 8px;"><a href="https://www.canva.com/design/DAHAJ2AuwbM/VnBpDnMfM3_xd3CYgVfWUA/edit?utm_content=DAHAJ2AuwbM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton" style="color: #667eea; text-decoration: none;">Example 1 - Menu Design</a></li>
                <li style="margin-bottom: 8px;"><a href="https://www.canva.com/design/DAHAJ48NFeY/PkcoFMt3r4_Zurtcv2HAVw/edit?utm_content=DAHAJ48NFeY&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton" style="color: #667eea; text-decoration: none;">Example 2 - Package Options</a></li>
                <li style="margin-bottom: 8px;"><a href="https://www.canva.com/design/DAHAJ-hVXU0/v9H5QEsDYaCuwEbvXlwbTA/edit?utm_content=DAHAJ-hVXU0&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton" style="color: #667eea; text-decoration: none;">Example 3 - Portfolio</a></li>
              </ul>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #667eea;">
              <p style="margin: 0 0 15px 0;"><strong>Book your call directly:</strong></p>
              <p style="margin: 5px 0;">📧 Reply to this email</p>
              <p style="margin: 5px 0;">📞 Call or text: <a href="tel:8056689973" style="color: #667eea; text-decoration: none;">(805) 668-9973</a></p>
              <p style="margin: 5px 0;">🌐 Visit: <a href="https://magicplate.info" style="color: #667eea; text-decoration: none; font-weight: 600;">magicplate.info</a></p>
            </div>
            
            <p style="margin-top: 30px;">Looking forward to connecting!</p>
            
            <p style="margin: 20px 0 0 0;">
              Best,<br>
              <strong>Sydney Ramey</strong><br>
              <em>MagicPlate.ai</em><br>
              <a href="mailto:sydney@magicplate.info">sydney@magicplate.info</a> | (805) 668-9973<br>
              <a href="https://instagram.com/rameyservices">Instagram: @Rameyservices</a>
            </p>
          </div>
          
          <div class="footer">
            <p>MagicPlate.ai - Where every plate becomes a masterpiece</p>
            <p><a href="https://magicplate.info">Visit our website</a> | <a href="mailto:sydney@magicplate.info">Contact us</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const text = `
Hi there!

My name is Sydney, and I'm reaching out from MagicPlate.ai. We specialize in food menu restoration – transforming outdated menus into stunning, modern designs that captivate customers and drive sales.

THE CHALLENGE:
We know the challenges: constantly hiring expensive photographers for new dishes, or struggling to make new items look great. A tired menu can silently erode your profits and make it harder to compete with the sleek, high-tech visuals seen elsewhere.

Our service gives your restaurant that "big city" visual appeal and professionalism, ensuring every dish looks irresistible and future updates are simple and cost-effective.

💰 THE RESULTS:
Clients often see a 20-30% increase in average order values after our menu revitalization.

DOORDASH ONBOARDING:
Additionally, for just $100 ($50 when bundled with menu restoration), we offer seamless DoorDash onboarding. We handle the setup, menu integration, and best practices to get you live quickly.

This unlocks new delivery customers, boosting off-peak revenue by 20-40% on average, and expands your reach effortlessly.

Ready to see how a professional menu and optimized delivery presence can significantly grow your business? Let's schedule a brief 15-minute Zoom call this week to explore your menu's potential and I can show you a few options from your menu!

Visit our website: https://magicplate.info

Watch our short welcome video here:
https://app.heygen.com/videos/11388ae023ba4fde9a6859dc46435cb3

View examples of our work and packages here:
https://www.canva.com/design/DAHAJ2AuwbM/VnBpDnMfM3_xd3CYgVfWUA/edit?utm_content=DAHAJ2AuwbM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

https://www.canva.com/design/DAHAJ48NFeY/PkcoFMt3r4_Zurtcv2HAVw/edit?utm_content=DAHAJ48NFeY&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

https://www.canva.com/design/DAHAJ-hVXU0/v9H5QEsDYaCuwEbvXlwbTA/edit?utm_content=DAHAJ-hVXU0&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

Book your call directly:
📧 Reply to this email
📞 Call or text: (805) 668-9973
🌐 Visit: https://magicplate.info

Looking forward to connecting!

Best,
Sydney Ramey
MagicPlate.ai
sydney@magicplate.info | (805) 668-9973
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
    try {
      const result = await resend.emails.send({
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
