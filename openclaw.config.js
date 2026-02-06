/**
 * OpenClaw Configuration for MagicPlate.ai
 * This configures OpenClaw to work with MagicPlate automations
 */

module.exports = {
  // OpenClaw settings
  name: 'MagicPlate Assistant',
  persona: 'You are MagicPlate Assistant, an AI assistant helping Sydney manage MagicPlate.ai - a restaurant marketing and branding platform. You help with lead scraping, email outreach, social media automation, and customer management.',
  
  // MagicPlate-specific context
  context: {
    business: 'MagicPlate.ai',
    owner: 'Sydney Ramey',
    phone: '(805) 668-9973',
    email: 'sydney@magicplate.info',
    website: 'https://magicplate.info',
    services: [
      'AI-powered menu photo enhancement',
      'Digital menu creation',
      'Email marketing campaigns',
      'Social media automation',
      'SEO optimization',
      'Multi-location management',
      'Franchise training videos'
    ]
  },

  // File paths
  paths: {
    leads: './data/qualified-leads.json',
    allLeads: './data/all-leads.json',
    sentEmails: './data/sent-emails.json',
    outreachTracking: './data/outreach-tracking.json',
    config: './config',
    scripts: './scripts',
    api: './api'
  },

  // API keys (loaded from .env)
  apis: {
    resend: process.env.RESEND_API_KEY,
    sendgrid: process.env.SENDGRID_API_KEY,
    googlePlaces: process.env.GOOGLE_PLACES_API_KEY,
    leonardo: process.env.LEONARDO_API_KEY,
    replicate: process.env.REPLICATE_API_TOKEN,
    heygen: process.env.HEYGEN_API_KEY,
    stripe: process.env.STRIPE_SECRET_KEY,
    instagram: process.env.INSTAGRAM_ACCESS_TOKEN,
    facebook: process.env.FACEBOOK_ACCESS_TOKEN,
    vapi: process.env.VAPI_API_KEY
  },

  // Automation schedules
  schedules: {
    dailyScraping: '0 9 * * *', // 9 AM daily
    emailOutreach: '0 10 * * *', // 10 AM daily
    followUps: '0 14 * * *', // 2 PM daily
    weeklyReport: '0 9 * * 1' // 9 AM Mondays
  },

  // Skills configuration
  skills: {
    email: {
      enabled: true,
      service: 'resend', // or 'sendgrid'
      fromEmail: process.env.FROM_EMAIL || 'sydney@magicplate.info',
      fromName: process.env.FROM_NAME || 'Sydney - MagicPlate'
    },
    scraping: {
      enabled: true,
      sources: ['googleMaps', 'yelp', 'outscraper'],
      defaultArea: process.env.SEARCH_AREA || 'Los Angeles, CA'
    },
    outreach: {
      enabled: true,
      channels: ['email', 'whatsapp', 'telegram', 'facebook'],
      batchSize: 5,
      delay: 3000
    },
    social: {
      enabled: true,
      platforms: ['instagram', 'facebook', 'twitter']
    }
  }
};
