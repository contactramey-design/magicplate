require('dotenv').config();

const path = require('path');
const fs = require('fs').promises;
const express = require('express');

const { sendEmail } = require('./config/email-config');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '1mb' }));

// Serve the homepage + assets
app.use(express.static(path.join(__dirname, 'public')));

const LEADS_FILE = path.join(__dirname, 'data', 'captured-leads.json');

async function readLeads() {
  try {
    const raw = await fs.readFile(LEADS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeLeads(leads) {
  await fs.mkdir(path.dirname(LEADS_FILE), { recursive: true });
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2));
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

// SPA-ish fallback (serve index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`MagicPlate dev server running on http://localhost:${PORT}`);
});

