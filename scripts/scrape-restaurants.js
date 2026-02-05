require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

// Scoring system for restaurant qualification
const scoreRestaurant = async (restaurant) => {
  let score = 0;
  const issues = [];
  const maxReviews = parseInt(process.env.MAX_REVIEWS) || 15;
  
  // Hard filter: too many reviews (already well‑established online)
  if (restaurant.totalRatings && restaurant.totalRatings > maxReviews) {
    issues.push('too_many_reviews');
    restaurant.qualificationScore = 0;
    restaurant.issues = issues;
    restaurant.isQualified = false;
    return restaurant;
  }
  
  // Check 1: Low/No Internet Presence (30 points)
  if (!restaurant.website || restaurant.website === 'N/A') {
    score += 30;
    issues.push('no_website');
  } else {
    try {
      const response = await axios.get(restaurant.website, {
        timeout: 5000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const $ = cheerio.load(response.data);
      
      // Check for outdated design indicators
      const hasModernFramework = $('script[src*="react"], script[src*="vue"], script[src*="angular"]').length > 0;
      const hasOldTech = $('script[src*="jquery"], script[src*="flash"]').length > 0;
      const hasMenuImages = $('img[src*="menu"], img[alt*="menu"], img[alt*="dish"], img[alt*="food"]').length;
      
      if (!hasModernFramework && hasOldTech) {
        score += 15;
        issues.push('outdated_website');
      }
      
      if (hasMenuImages === 0) {
        score += 15;
        issues.push('no_menu_photos');
      }
    } catch (error) {
      // Website doesn't work or doesn't exist
      score += 20;
      issues.push('broken_website');
    }
  }
  
  // Check 2: Not on DoorDash (25 points)
  try {
    const doordashUrl = `https://www.doordash.com/store/${restaurant.name.toLowerCase().replace(/\s+/g, '-')}-${restaurant.city?.toLowerCase() || ''}`;
    const ddResponse = await axios.get(doordashUrl, { timeout: 3000, validateStatus: () => true });
    
    if (ddResponse.status === 404 || !ddResponse.data.includes('DoorDash')) {
      score += 25;
      issues.push('not_on_doordash');
    }
  } catch (error) {
    // Not found on DoorDash
    score += 25;
    issues.push('not_on_doordash');
  }
  
  // Check 3: Low Social Media Presence (20 points)
  if (!restaurant.instagram && !restaurant.facebook) {
    score += 20;
    issues.push('no_social_media');
  } else {
    // Could add API checks here for follower counts, post frequency, etc.
    if (restaurant.instagram && restaurant.instagramFollowers < 500) {
      score += 10;
      issues.push('low_social_engagement');
    }
  }
  
  // Check 4: Outdated Menu Indicators (15 points)
  if (restaurant.lastMenuUpdate) {
    const daysSinceUpdate = (new Date() - new Date(restaurant.lastMenuUpdate)) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate > 365) {
      score += 15;
      issues.push('outdated_menu');
    }
  } else {
    // No menu update date = likely outdated
    score += 10;
    issues.push('unknown_menu_age');
  }
  
  // Check 5: Low Rating but Still Operating (10 points)
  // Restaurants with low ratings might need help with presentation
  if (restaurant.rating && restaurant.rating < 3.5 && restaurant.rating > 2.5) {
    score += 10;
    issues.push('low_rating');
  }
  
  // Check 6: No Professional Photos (10 points)
  if (!restaurant.hasProfessionalPhotos) {
    score += 10;
    issues.push('no_professional_photos');
  }
  
  restaurant.qualificationScore = score;
  restaurant.issues = issues;
  restaurant.isQualified = score >= (parseInt(process.env.QUALIFICATION_THRESHOLD) || 40);
  
  return restaurant;
};

// Helper function to parse geocode from area string or env
function parseGeocode(area) {
  // Check if area is already a geocode (lat,lng format)
  const geocodeMatch = area.match(/(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (geocodeMatch) {
    return {
      lat: parseFloat(geocodeMatch[1]),
      lng: parseFloat(geocodeMatch[2])
    };
  }
  
  // Check for geocode in env with radius
  if (process.env.GEOCODE) {
    const geoMatch = process.env.GEOCODE.match(/(-?\d+\.?\d*),(-?\d+\.?\d*)(?:,(\d+)km)?/);
    if (geoMatch) {
      return {
        lat: parseFloat(geoMatch[1]),
        lng: parseFloat(geoMatch[2]),
        radius: geoMatch[3] ? parseInt(geoMatch[3]) : null
      };
    }
  }
  
  return null;
}

// Enhanced scraping with qualification
const scrapeSources = {
  googleMaps: async (area, radius = 10, options = {}) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      console.warn('⚠️  Google Places API key not set, skipping Google Maps');
      return [];
    }
    
    const geocode = parseGeocode(area);
    const excludeDoordash = options.excludeDoordash !== false; // Default true
    const targetIndependent = options.targetIndependent !== false; // Default true
    
    // Build query with filters
    let query = '';
    if (targetIndependent) {
      query = `independent restaurants ${area}`;
    } else {
      query = `restaurants ${area}`;
    }
    
    // Add exclusion for DoorDash if enabled
    if (excludeDoordash) {
      query += ' -site:doordash.com';
    }
    
    const params = {
      query,
      key: apiKey,
      type: 'restaurant'
    };
    
    // Add location and radius if geocode is provided
    if (geocode) {
      params.location = `${geocode.lat},${geocode.lng}`;
      if (geocode.radius) {
        params.radius = geocode.radius * 1000; // Convert km to meters
      } else if (radius) {
        params.radius = radius * 1000; // Convert km to meters
      }
    }
    
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
        params
      });
      
      const restaurants = await Promise.all(
        response.data.results.map(async (place) => {
          // Get detailed info
          let details = {};
          try {
            const detailResponse = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
              params: {
                place_id: place.place_id,
                key: apiKey,
                fields: 'website,formatted_phone_number,opening_hours,photos,reviews'
              }
            });
            details = detailResponse.data.result || {};
          } catch (error) {
            // Skip if details fail
          }
          
          return {
            name: place.name,
            address: place.formatted_address,
            phone: details.formatted_phone_number || place.formatted_phone_number,
            website: details.website || null,
            rating: place.rating,
            totalRatings: place.user_ratings_total,
            placeId: place.place_id,
            city: place.formatted_address.split(',')[1]?.trim(),
            state: place.formatted_address.split(',')[2]?.trim(),
            hasPhotos: (details.photos && details.photos.length > 0),
            hasProfessionalPhotos: false, // Will check later
            source: 'google_maps',
            coordinates: place.geometry?.location
          };
        })
      );
      
      return restaurants;
    } catch (error) {
      console.error('❌ Google Maps API error:', error.message);
      return [];
    }
  },

  yelp: async (area) => {
    const apiKey = process.env.YELP_API_KEY;
    if (!apiKey) {
      console.warn('⚠️  Yelp API key not set, skipping Yelp');
      return [];
    }
    
    try {
      const response = await axios.get('https://api.yelp.com/v3/businesses/search', {
        params: {
          term: 'restaurants',
          location: area,
          limit: 50,
          sort_by: 'rating'
        },
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      });
      
      return response.data.businesses.map(business => ({
        name: business.name,
        address: business.location.display_address.join(', '),
        phone: business.phone,
        website: business.url,
        rating: business.rating,
        totalRatings: business.review_count,
        yelpId: business.id,
        city: business.location.city,
        state: business.location.state,
        instagram: business.url,
        hasPhotos: (business.photos && business.photos.length > 0),
        source: 'yelp'
      }));
    } catch (error) {
      console.error('❌ Yelp API error:', error.message);
      return [];
    }
  },

  outscraper: async (area, limit = 100, options = {}) => {
    const apiKey = process.env.OUTSCRAPER_API_KEY;
    if (!apiKey) {
      console.warn('⚠️  Outscraper API key not set, skipping Outscraper');
      return [];
    }
    
    const geocode = parseGeocode(area);
    const excludeDoordash = options.excludeDoordash !== false; // Default true
    const targetIndependent = options.targetIndependent !== false; // Default true
    
    // Build query with filters
    let query = '';
    if (targetIndependent) {
      query = `independent restaurants, ${area}`;
    } else {
      query = `restaurants, ${area}`;
    }
    
    // Add exclusion for DoorDash if enabled
    if (excludeDoordash) {
      query += ' -site:doordash.com';
    }
    
    const params = {
      query: query,
      limit: limit,
      async: false
    };
    
    // Add geocode filter if available
    if (geocode) {
      params.latitude = geocode.lat;
      params.longitude = geocode.lng;
      if (geocode.radius) {
        params.radius = geocode.radius; // Outscraper uses km
      }
    }
    
    try {
      const response = await axios.get('https://api.outscraper.cloud/google-maps-search', {
        params,
        headers: {
          'X-API-KEY': apiKey
        }
      });
      
      // Outscraper returns data in data array
      const results = response.data?.data || response.data || [];
      
      return results.map((place) => {
        // Outscraper field names may vary, handle different formats
        const name = place.name || place.title || place.full_name || '';
        const address = place.address || place.full_address || place.location || '';
        const phone = place.phone || place.phone_number || place.phone_international || null;
        const website = place.website || place.site || null;
        const rating = parseFloat(place.rating || place.reviews_average || 0);
        const totalRatings = parseInt(place.reviews || place.reviews_count || 0);
        
        // Extract city/state from address
        const addressParts = address.split(',').map(s => s.trim());
        const city = addressParts[addressParts.length - 3] || '';
        const state = addressParts[addressParts.length - 2] || '';
        
        return {
          name: name,
          address: address,
          phone: phone,
          website: website,
          rating: rating || null,
          totalRatings: totalRatings || 0,
          city: city,
          state: state,
          hasPhotos: !!(place.photos && place.photos.length > 0),
          hasProfessionalPhotos: false,
          source: 'outscraper',
          outscraperId: place.id || place.place_id || null
        };
      }).filter(place => place.name); // Filter out invalid entries
      
    } catch (error) {
      console.error('❌ Outscraper API error:', error.response?.data || error.message);
      return [];
    }
  }
};

async function findEmails(leads) {
  // Enhanced email finding
  for (const lead of leads) {
    if (!lead.email && lead.website) {
      try {
        const response = await axios.get(lead.website, {
          timeout: 5000,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        const $ = cheerio.load(response.data);
        
        // Multiple strategies to find email
        const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
        const pageText = $('body').text();
        GOOGLE_PLACES_API_KEY=YOUR_NEW_GOOGLE_KEY_HERE
                const emails = pageText.match(emailRegex) || [];
        
        // Also check contact page
        let contactEmails = [];
        try {
          const contactLinks = $('a[href*="contact"], a[href*="about"]').attr('href');
          if (contactLinks) {
            const contactUrl = new URL(contactLinks, lead.website).href;
            const contactResponse = await axios.get(contactUrl, { timeout: 3000 });
            const contactText = contactResponse.data.match(emailRegex) || [];
            contactEmails = contactText;
          }
        } catch (e) {
          // Contact page not accessible
        }
        
        // Combine and filter
        const allEmails = [...emails, ...contactEmails];
        const contactEmail = allEmails.find(e => 
          !e.includes('noreply') && 
          !e.includes('no-reply') &&
          !e.includes('privacy') &&
          !e.includes('support@') &&
          !e.includes('hello@') &&
          (e.includes('info@') || e.includes('contact@') || (e.includes('@') && e.split('@')[0].length < 20))
        );
        
        if (contactEmail) {
          lead.email = contactEmail.toLowerCase();
        } else if (lead.name && lead.website) {
          // Try common patterns
          try {
            const domain = new URL(lead.website).hostname.replace('www.', '');
            const commonEmails = [
              `info@${domain}`,
              `contact@${domain}`,
              `hello@${domain}`,
              `sales@${domain}`
            ];
            lead.potentialEmails = commonEmails;
          } catch (e) {
            // Invalid URL
          }
        }
      } catch (error) {
        // Website not accessible or no email found
      }
    }
  }
  
  return leads;
}

async function scrapeAndQualifyLeads(area, sources = ['googleMaps', 'yelp'], options = {}) {
  const geocode = parseGeocode(area);
  const searchRadius = parseInt(process.env.SEARCH_RADIUS) || options.radius || 10;
  const maxReviews = parseInt(process.env.MAX_REVIEWS) || 15;
  
  // Build scraping options
  const scrapeOptions = {
    excludeDoordash: process.env.EXCLUDE_DOORDASH === 'true', // default: do NOT exclude
    targetIndependent: process.env.TARGET_INDEPENDENT !== 'false', // Default true
    radius: searchRadius
  };
  
  if (geocode) {
    console.log(`🔍 Scraping restaurants near ${geocode.lat},${geocode.lng} (radius: ${geocode.radius || searchRadius}km)`);
  } else {
    console.log(`🔍 Scraping restaurants in: ${area}`);
  }
  console.log(`   🧮 Max reviews allowed: ${maxReviews}`);
  if (scrapeOptions.excludeDoordash) {
    console.log(`   🚫 Excluding restaurants already on DoorDash`);
  } else {
    console.log(`   ✅ Including restaurants that are already on DoorDash`);
  }
  if (scrapeOptions.targetIndependent) {
    console.log(`   🎯 Targeting independent restaurants`);
  }
  console.log('');
  
  // Step 1: Scrape all leads
  const allLeads = [];
  const seen = new Set();
  
  for (const source of sources) {
    try {
      console.log(`📡 Scraping from ${source}...`);
      const leads = await scrapeSources[source](area, searchRadius, scrapeOptions);
      
      leads.forEach(lead => {
        const key = `${lead.name}-${lead.address}`.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          allLeads.push({
            ...lead,
            scrapedAt: new Date().toISOString(),
            email: null,
            status: 'new'
          });
        }
      });
      
      console.log(`✅ Found ${leads.length} leads from ${source}`);
    } catch (error) {
      console.error(`❌ Error scraping ${source}:`, error.message);
    }
  }
  
  console.log(`\n📊 Total unique leads: ${allLeads.length}`);
  
  // Step 2: Find emails
  console.log(`\n📧 Finding email addresses...`);
  let leadsWithEmails = await findEmails(allLeads);
  const withEmail = leadsWithEmails.filter(l => l.email).length;
  console.log(`✅ Found ${withEmail} emails`);
  
  // Step 3: Qualify leads (score them)
  console.log(`\n🎯 Qualifying leads based on criteria...`);
  const qualifiedLeads = [];
  
  for (let i = 0; i < leadsWithEmails.length; i++) {
    const lead = leadsWithEmails[i];
    process.stdout.write(`\r   Processing ${i + 1}/${leadsWithEmails.length}...`);
    const scored = await scoreRestaurant(lead);
    if (scored.isQualified) {
      qualifiedLeads.push(scored);
    }
  }
  process.stdout.write('\n');
  
  // Sort by qualification score (highest first)
  qualifiedLeads.sort((a, b) => b.qualificationScore - a.qualificationScore);
  
  console.log(`\n✨ Qualified leads (score >= ${process.env.QUALIFICATION_THRESHOLD || 40}): ${qualifiedLeads.length}`);
  if (qualifiedLeads.length > 0) {
    console.log(`\n📋 Top 10 Qualified Leads:`);
    qualifiedLeads.slice(0, 10).forEach((lead, i) => {
      console.log(`   ${i + 1}. ${lead.name} - Score: ${lead.qualificationScore} - Issues: ${lead.issues.join(', ')}`);
    });
  }
  
  return {
    all: leadsWithEmails,
    qualified: qualifiedLeads
  };
}

async function saveLeads(leads, filename = 'leads.json') {
  const dataDir = path.join(__dirname, '..', 'data');
  await fs.mkdir(dataDir, { recursive: true });
  const filePath = path.join(dataDir, filename);
  await fs.writeFile(filePath, JSON.stringify(leads, null, 2));
  console.log(`\n💾 Saved leads to ${filePath}`);
}

async function main() {
  // Support both SEARCH_AREA and GEOCODE
  let area = process.env.SEARCH_AREA || 'Los Angeles, CA';
  
  // If GEOCODE is set, use it (takes priority)
  if (process.env.GEOCODE) {
    const geocode = parseGeocode(process.env.GEOCODE);
    if (geocode) {
      area = `${geocode.lat},${geocode.lng}`;
      if (geocode.radius) {
        console.log(`📍 Using geocode: ${geocode.lat},${geocode.lng} with ${geocode.radius}km radius`);
      } else {
        console.log(`📍 Using geocode: ${geocode.lat},${geocode.lng}`);
      }
    }
  }
  
  const sources = [];
  
  if (process.env.GOOGLE_PLACES_API_KEY) sources.push('googleMaps');
  if (process.env.YELP_API_KEY) sources.push('yelp');
  if (process.env.OUTSCRAPER_API_KEY) sources.push('outscraper');
  
  if (sources.length === 0) {
    console.error('❌ No API keys configured. Set at least one: GOOGLE_PLACES_API_KEY, YELP_API_KEY, or OUTSCRAPER_API_KEY in .env');
    process.exit(1);
  }
  
  const options = {
    excludeDoordash: process.env.EXCLUDE_DOORDASH !== 'false',
    targetIndependent: process.env.TARGET_INDEPENDENT !== 'false',
    radius: parseInt(process.env.SEARCH_RADIUS) || 10
  };
  
  const results = await scrapeAndQualifyLeads(area, sources, options);
  
  // Save all leads
  await saveLeads(results.all, 'all-leads.json');
  
  // Save qualified leads separately
  await saveLeads(results.qualified, 'qualified-leads.json');
  
  // Send to n8n if configured
  if (process.env.N8N_WEBHOOK_URL) {
    try {
      await axios.post(process.env.N8N_WEBHOOK_URL, { 
        qualifiedLeads: results.qualified,
        totalLeads: results.all.length
      });
      console.log('✅ Leads sent to n8n webhook');
    } catch (error) {
      console.error('❌ Error sending to n8n:', error.message);
    }
  }
  
  return results;
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { scrapeAndQualifyLeads, scoreRestaurant, findEmails };
