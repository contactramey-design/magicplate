const path = require('path');
const fs = require('fs');

// Load environment variables - check multiple locations
// Try .env.local first (if exists), then .env
const envLocalPath = path.join(__dirname, '.env.local');
const envPath = path.join(__dirname, '.env');

// Load .env first (base config)
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log('✅ Loaded .env');
}

// Then load .env.local (overrides .env, but only if values exist)
if (fs.existsSync(envLocalPath)) {
  const envBackup = { ...process.env }; // Backup .env values
  require('dotenv').config({ path: envLocalPath, override: true });
  
  // If .env.local has empty values, restore from .env
  Object.keys(process.env).forEach(key => {
    if (process.env[key] === '' && envBackup[key] && envBackup[key] !== '') {
      process.env[key] = envBackup[key];
    }
  });
  console.log('✅ Loaded .env.local (overrides .env where set)');
}

// Verify Leonardo key
const leonardoKey = process.env.LEONARDO_API_KEY;
if (leonardoKey) {
  console.log(`✅ LEONARDO_API_KEY: Set (${leonardoKey.length} characters)`);
  console.log(`   Preview: ${leonardoKey.substring(0, 15)}...`);
} else {
  console.log('❌ LEONARDO_API_KEY: NOT SET');
  console.log('   Make sure it\'s in .env.local and saved (Cmd+S)');
}
// fsPromises for async file operations
const fsPromises = require('fs').promises;
const express = require('express');

const { sendEmail } = require('./config/email-config');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' })); // Increased for image uploads

// Serve the homepage + assets
app.use(express.static(path.join(__dirname, 'public')));

const LEADS_FILE = path.join(__dirname, 'data', 'captured-leads.json');

async function readLeads() {
  try {
    const raw = await fsPromises.readFile(LEADS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeLeads(leads) {
  await fsPromises.mkdir(path.dirname(LEADS_FILE), { recursive: true });
  await fsPromises.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.post('/api/leads', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const source = String(req.body?.source || 'homepage').trim();

    if (!isValidEmail(email)) {
      return res.status(400).json({ ok: false, error: 'invalid_email' });
    }

    const leads = await readLeads();
    const existing = leads.find((l) => l.email === email);
    const now = new Date().toISOString();

    if (!existing) {
      leads.push({
        email,
        source,
        createdAt: now,
        lastSentAt: null,
        followup3SentAt: null,
        followup7SentAt: null,
      });
      await writeLeads(leads);
    }

    // Send immediate confirmation to the lead (optional but good UX)
    if (process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY) {
      const fromEmail = process.env.FROM_EMAIL || 'sydney@magicplate.info';
      const fromName = process.env.FROM_NAME || 'Sydney - MagicPlate';

      await sendEmail({
        to: email,
        from: { email: fromEmail, name: fromName },
        subject: 'Your free MagicPlate sample is coming ✨',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
            <h2 style="margin: 0 0 12px 0;">You’re in!</h2>
            <p style="margin: 0 0 12px 0;">Thanks for playing. Reply to this email with your restaurant name + a few menu photos and I’ll send a free sample enhancement.</p>
            <p style="margin: 0 0 12px 0;"><strong>MagicPlate</strong> — make every plate magical.</p>
          </div>
        `,
        text:
          "You're in!\n\nThanks for playing. Reply with your restaurant name + a few menu photos and I’ll send a free sample enhancement.\n\nMagicPlate — make every plate magical.",
      });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'server_error' });
  }
});

// Diagnostic endpoint to check API configuration
app.get('/api/check-config', (req, res) => {
  require('dotenv').config(); // Reload env vars
  res.json({
    leonardo: {
      configured: !!process.env.LEONARDO_API_KEY,
      length: process.env.LEONARDO_API_KEY?.length || 0,
      preview: process.env.LEONARDO_API_KEY ? 
        process.env.LEONARDO_API_KEY.substring(0, 10) + '...' : 'Not set'
    },
    together: {
      configured: !!process.env.TOGETHER_API_KEY,
      length: process.env.TOGETHER_API_KEY?.length || 0
    },
    replicate: {
      configured: !!process.env.REPLICATE_API_TOKEN,
      length: process.env.REPLICATE_API_TOKEN?.length || 0
    },
    envFile: {
      exists: require('fs').existsSync(require('path').join(__dirname, '.env')),
      path: require('path').join(__dirname, '.env')
    }
  });
});

// Image enhancement API endpoint (for local development)
// Handle OPTIONS for CORS preflight
app.options('/api/enhance-image', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

app.post('/api/enhance-image', async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Reload env vars in case they were updated
    require('dotenv').config();
    
    // Import and use the enhance-image handler
    const enhanceImageHandler = require('./api/enhance-image');
    return await enhanceImageHandler(req, res);
  } catch (error) {
    console.error('Enhance image route error:', error);
    console.error('Stack:', error.stack);
    return res.status(500).json({ 
      error: 'Enhancement failed', 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, restaurant, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    
    // Send email using your email service
    // Note: Update to use Resend receiving address if configured
    const receivingEmail = process.env.RECEIVING_EMAIL || 'sydney@preneionte.resend.app';
    await sendEmail({
      to: receivingEmail,
      from: { email: process.env.FROM_EMAIL || 'sydney@magicplate.info', name: 'MagicPlate Contact Form' },
      subject: `New Contact Form Submission from ${name}${restaurant ? ` - ${restaurant}` : ''}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${restaurant ? `<p><strong>Restaurant:</strong> ${restaurant}</p>` : ''}
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
      `,
      text: `New Contact Form Submission\n\nName: ${name}\nEmail: ${email}\n${restaurant ? `Restaurant: ${restaurant}\n` : ''}Message: ${message}`
    });
    
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Platform API Routes
// Subscription Management - Signup route must come first
app.post('/api/subscriptions/signup', require('./api/subscriptions/signup'));
app.use('/api/subscriptions', require('./api/subscriptions'));

// Restaurant Management
app.use('/api/restaurants', require('./api/restaurants'));

// HeyGen Integration
app.use('/api/heygen', require('./api/heygen'));

// Branding & Guidelines
app.use('/api/branding', require('./api/branding'));

// Multi-Location Management
app.use('/api/locations', require('./api/locations'));

// Marketing Automation
app.use('/api/marketing', require('./api/marketing'));

// SEO Marketing Routes
app.use('/api/marketing/seo', require('./api/marketing/seo'));

// Digital Menus
app.use('/api/menus', require('./api/menus'));

// Social Media
app.use('/api/social', require('./api/social'));

// Email Marketing
app.use('/api/email', require('./api/email'));

// Support System
app.use('/api/support', require('./api/support'));

// Cron Jobs
app.use('/api/cron', require('./api/cron'));

// Training System
app.use('/api/training', require('./api/training'));

// Analytics & Reporting
app.use('/api/analytics', require('./api/analytics'));

      // SPA-ish fallback (serve index.html)
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
      });

// For Vercel serverless functions
module.exports = app;

// For local development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`MagicPlate dev server running on http://localhost:${PORT}`);
  });
}

