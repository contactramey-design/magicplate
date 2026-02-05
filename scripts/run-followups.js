require('dotenv').config();

const path = require('path');
const fs = require('fs').promises;
const { sendEmail } = require('../config/email-config');

const LEADS_FILE = path.join(__dirname, '..', 'data', 'captured-leads.json');

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

function daysSince(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  return ms / (1000 * 60 * 60 * 24);
}

async function main() {
  const hasEmailService = !!(process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY);
  if (!hasEmailService) {
    console.error('No email service configured. Set RESEND_API_KEY or SENDGRID_API_KEY in .env');
    process.exit(1);
  }

  const fromEmail = process.env.FROM_EMAIL || 'sydney@magicplate.info';
  const fromName = process.env.FROM_NAME || 'Sydney - MagicPlate';

  const leads = await readLeads();
  if (leads.length === 0) {
    console.log('No captured leads yet.');
    return;
  }

  let sent3 = 0;
  let sent7 = 0;

  for (const lead of leads) {
    // Day 3 follow-up
    if (lead.createdAt && !lead.followup3SentAt && daysSince(lead.createdAt) >= 3) {
      await sendEmail({
        to: lead.email,
        from: { email: fromEmail, name: fromName },
        subject: 'Quick follow-up — want a free sample?',
        html:
          '<p style="font-family: Arial, sans-serif; color:#111;">Just checking in — reply with your restaurant name + 2–3 menu photos and I’ll send a free MagicPlate enhancement sample.</p>',
        text:
          'Just checking in — reply with your restaurant name + 2–3 menu photos and I’ll send a free MagicPlate enhancement sample.',
      });
      lead.followup3SentAt = new Date().toISOString();
      sent3++;
    }

    // Day 7 offer
    if (lead.createdAt && !lead.followup7SentAt && daysSince(lead.createdAt) >= 7) {
      await sendEmail({
        to: lead.email,
        from: { email: fromEmail, name: fromName },
        subject: 'Last note — 48hr digital menu turnaround',
        html:
          '<p style="font-family: Arial, sans-serif; color:#111;">If you want to try MagicPlate, we can turn a menu into a shareable digital link in 48 hours. Reply “YES” and I’ll send details.</p>',
        text:
          'If you want to try MagicPlate, we can turn a menu into a shareable digital link in 48 hours. Reply “YES” and I’ll send details.',
      });
      lead.followup7SentAt = new Date().toISOString();
      sent7++;
    }
  }

  await writeLeads(leads);
  console.log(`Followups sent: day3=${sent3}, day7=${sent7}`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

