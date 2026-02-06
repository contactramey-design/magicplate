/**
 * OpenClaw Skill: MagicPlate Restaurant Scraping
 * Scrapes restaurants from Google Maps, Yelp, and Outscraper
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

/**
 * Scrape restaurants from Google Maps
 */
async function scrapeGoogleMaps(area, limit = 100) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_PLACES_API_KEY not set');
  }

  const query = `restaurants in ${area}`;
  const url = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
  
  try {
    const response = await axios.get(url, {
      params: {
        query,
        key: apiKey,
        type: 'restaurant'
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Google Places API error: ${response.data.status}`);
    }

    const places = response.data.results.slice(0, limit);
    
    // Get details for each place
    const restaurants = await Promise.all(
      places.map(async (place) => {
        try {
          const detailResponse = await axios.get(
            'https://maps.googleapis.com/maps/api/place/details/json',
            {
              params: {
                place_id: place.place_id,
                key: apiKey,
                fields: 'name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,photos'
              }
            }
          );

          const details = detailResponse.data.result;
          return {
            name: details.name || place.name,
            address: details.formatted_address || place.formatted_address,
            phone: details.formatted_phone_number || null,
            website: details.website || null,
            rating: details.rating || place.rating || null,
            totalRatings: details.user_ratings_total || 0,
            place_id: place.place_id,
            source: 'google_maps',
            hasPhotos: !!(details.photos && details.photos.length > 0)
          };
        } catch (error) {
          return {
            name: place.name,
            address: place.formatted_address,
            place_id: place.place_id,
            source: 'google_maps',
            error: error.message
          };
        }
      })
    );

    return restaurants.filter(r => r.name);
  } catch (error) {
    throw new Error(`Google Maps scraping failed: ${error.message}`);
  }
}

/**
 * Qualify leads based on MagicPlate criteria
 */
function qualifyLeads(leads) {
  return leads.map(lead => {
    let score = 0;
    const issues = [];

    // No website (30 points)
    if (!lead.website) {
      score += 30;
      issues.push('no_website');
    }

    // Low rating (10 points)
    if (lead.rating && lead.rating < 3.5) {
      score += 10;
      issues.push('low_rating');
    }

    // No professional photos (10 points)
    if (!lead.hasPhotos) {
      score += 10;
      issues.push('no_professional_photos');
    }

    // Low review count (15 points)
    if (lead.totalRatings < 20) {
      score += 15;
      issues.push('low_reviews');
    }

    return {
      ...lead,
      qualification_score: score,
      issues,
      qualified: score >= 40
    };
  });
}

/**
 * Scrape and save restaurants
 */
async function scrapeAndSave(area, limit = 100) {
  console.log(`🔍 Scraping restaurants in ${area}...`);
  
  const restaurants = await scrapeGoogleMaps(area, limit);
  console.log(`✅ Found ${restaurants.length} restaurants`);
  
  const qualified = qualifyLeads(restaurants);
  const qualifiedLeads = qualified.filter(r => r.qualified);
  
  console.log(`✅ ${qualifiedLeads.length} qualified leads (score >= 40)`);
  
  // Save to files
  const dataDir = path.join(__dirname, '..', 'data');
  await fs.mkdir(dataDir, { recursive: true });
  
  const allLeadsPath = path.join(dataDir, 'all-leads.json');
  const qualifiedPath = path.join(dataDir, 'qualified-leads.json');
  
  // Merge with existing leads
  let existingLeads = [];
  try {
    const existing = await fs.readFile(allLeadsPath, 'utf8');
    existingLeads = JSON.parse(existing);
  } catch {
    existingLeads = [];
  }
  
  // Deduplicate by place_id
  const leadMap = new Map();
  existingLeads.forEach(lead => {
    if (lead.place_id) {
      leadMap.set(lead.place_id, lead);
    }
  });
  
  restaurants.forEach(lead => {
    if (lead.place_id) {
      leadMap.set(lead.place_id, lead);
    }
  });
  
  const allLeads = Array.from(leadMap.values());
  const allQualified = qualifyLeads(allLeads).filter(r => r.qualified);
  
  await fs.writeFile(allLeadsPath, JSON.stringify(allLeads, null, 2));
  await fs.writeFile(qualifiedPath, JSON.stringify(allQualified, null, 2));
  
  return {
    total: restaurants.length,
    qualified: qualifiedLeads.length,
    allLeads: allLeads.length,
    allQualified: allQualified.length
  };
}

module.exports = {
  scrapeGoogleMaps,
  qualifyLeads,
  scrapeAndSave
};
