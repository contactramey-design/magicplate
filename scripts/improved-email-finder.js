/**
 * Improved Email Finder
 * Uses multiple strategies to find restaurant emails
 */

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Strategy 1: Check website contact page
 */
async function findEmailFromWebsite(website) {
  if (!website) return [];
  
  const emails = new Set();
  const urlsToCheck = [
    website,
    `${website}/contact`,
    `${website}/contact-us`,
    `${website}/about`,
    `${website}/contact.html`
  ];
  
  for (const url of urlsToCheck) {
    try {
      const response = await axios.get(url, {
        timeout: 3000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      
      const $ = cheerio.load(response.data);
      
      // Find email addresses in page
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const pageText = $('body').text();
      const matches = pageText.match(emailRegex);
      
      if (matches) {
        matches.forEach(email => {
          // Filter out common non-contact emails
          if (!email.includes('noreply') && 
              !email.includes('no-reply') && 
              !email.includes('privacy') &&
              !email.includes('abuse')) {
            emails.add(email.toLowerCase());
          }
        });
      }
      
      // Check mailto links
      $('a[href^="mailto:"]').each((i, el) => {
        const href = $(el).attr('href');
        const email = href.replace('mailto:', '').split('?')[0].toLowerCase();
        if (email) emails.add(email);
      });
      
      // Check contact forms (hidden fields)
      $('input[type="email"]').each((i, el) => {
        const value = $(el).val();
        if (value && emailRegex.test(value)) {
          emails.add(value.toLowerCase());
        }
      });
      
    } catch (error) {
      // Continue to next URL
    }
  }
  
  return Array.from(emails);
}

/**
 * Strategy 2: Check Google Business Profile
 */
async function findEmailFromGoogleBusiness(placeId) {
  if (!placeId || !process.env.GOOGLE_PLACES_API_KEY) return [];
  
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json`,
      {
        params: {
          place_id: placeId,
          fields: 'website,formatted_phone_number,international_phone_number',
          key: process.env.GOOGLE_PLACES_API_KEY
        }
      }
    );
    
    // Google Places doesn't return email directly, but we can check website
    if (response.data.result?.website) {
      return await findEmailFromWebsite(response.data.result.website);
    }
  } catch (error) {
    // Continue
  }
  
  return [];
}

/**
 * Strategy 3: Check Yelp (if available)
 */
async function findEmailFromYelp(yelpUrl) {
  if (!yelpUrl) return [];
  
  try {
    const response = await axios.get(yelpUrl, {
      timeout: 3000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    
    const $ = cheerio.load(response.data);
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const pageText = $('body').text();
    const matches = pageText.match(emailRegex);
    
    if (matches) {
      return matches
        .filter(email => !email.includes('noreply') && !email.includes('yelp'))
        .map(e => e.toLowerCase());
    }
  } catch (error) {
    // Continue
  }
  
  return [];
}

/**
 * Strategy 4: Generate common email patterns
 */
function generateCommonEmails(restaurant) {
  const emails = [];
  const name = restaurant.name || '';
  
  // Clean restaurant name for email
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .substring(0, 20);
  
  if (!cleanName) return emails;
  
  const domain = restaurant.website 
    ? new URL(restaurant.website).hostname.replace('www.', '')
    : null;
  
  if (!domain) return emails;
  
  // Common patterns
  const patterns = [
    `info@${domain}`,
    `contact@${domain}`,
    `hello@${domain}`,
    `${cleanName}@${domain}`,
    `info@${cleanName}.com`,
    `contact@${cleanName}.com`
  ];
  
  return patterns;
}

/**
 * Main function: Find all possible emails
 */
async function findRestaurantEmails(restaurant) {
  const emails = new Set();
  
  // Strategy 1: Website scraping
  if (restaurant.website) {
    const websiteEmails = await findEmailFromWebsite(restaurant.website);
    websiteEmails.forEach(e => emails.add(e));
  }
  
  // Strategy 2: Google Business
  if (restaurant.place_id) {
    const googleEmails = await findEmailFromGoogleBusiness(restaurant.place_id);
    googleEmails.forEach(e => emails.add(e));
  }
  
  // Strategy 3: Yelp
  if (restaurant.yelp_url) {
    const yelpEmails = await findEmailFromYelp(restaurant.yelp_url);
    yelpEmails.forEach(e => emails.add(e));
  }
  
  // Strategy 4: Common patterns
  const commonEmails = generateCommonEmails(restaurant);
  commonEmails.forEach(e => emails.add(e));
  
  return Array.from(emails);
}

module.exports = {
  findRestaurantEmails,
  findEmailFromWebsite,
  generateCommonEmails
};
