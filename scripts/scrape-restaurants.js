require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

// Instagram Graph API integration
async function findInstagramProfile(restaurant) {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const facebookAppId = process.env.FACEBOOK_APP_ID;
  
  // Skip if Instagram API not configured
  if (!accessToken || !facebookAppId) {
    return null;
  }
  
  try {
    // Strategy 1: Search by business name using Facebook Pages API
    // First, search for Facebook Pages matching the restaurant name
    const searchQuery = encodeURIComponent(restaurant.name);
    const locationQuery = restaurant.city ? encodeURIComponent(restaurant.city) : '';
    
    // Search Facebook Pages
    const pagesResponse = await axios.get(`https://graph.facebook.com/v18.0/search`, {
      params: {
        q: searchQuery,
        type: 'page',
        fields: 'id,name,username,website,instagram_business_account',
        access_token: accessToken,
        limit: 5
      },
      timeout: 5000
    });
    
    if (pagesResponse.data.data && pagesResponse.data.data.length > 0) {
      // Find the best matching page
      const matchingPage = pagesResponse.data.data.find(page => {
        const pageNameLower = page.name.toLowerCase();
        const restaurantNameLower = restaurant.name.toLowerCase();
        return pageNameLower.includes(restaurantNameLower) || 
               restaurantNameLower.includes(pageNameLower) ||
               pageNameLower === restaurantNameLower;
      }) || pagesResponse.data.data[0];
      
      // Check if page has Instagram Business Account linked
      if (matchingPage.instagram_business_account) {
        const igAccountId = matchingPage.instagram_business_account.id;
        
        // Get Instagram account details
        const igResponse = await axios.get(`https://graph.facebook.com/v18.0/${igAccountId}`, {
          params: {
            fields: 'username,profile_picture_url,biography,website,followers_count,media_count',
            access_token: accessToken
          },
          timeout: 5000
        });
        
        return {
          instagramHandle: igResponse.data.username,
          instagramUrl: `https://instagram.com/${igResponse.data.username}`,
          instagramId: igAccountId,
          profilePicture: igResponse.data.profile_picture_url,
          bio: igResponse.data.biography,
          website: igResponse.data.website || restaurant.website,
          followers: igResponse.data.followers_count,
          mediaCount: igResponse.data.media_count,
          facebookPageId: matchingPage.id,
          facebookPageName: matchingPage.name
        };
      }
      
      // If no Instagram account linked, return Facebook page info
      return {
        facebookPageId: matchingPage.id,
        facebookPageName: matchingPage.name,
        facebookUrl: `https://facebook.com/${matchingPage.username || matchingPage.id}`,
        website: matchingPage.website || restaurant.website
      };
    }
  } catch (error) {
    // If Graph API fails, try web scraping as fallback
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log(`   ⚠️  Instagram API authentication failed - check access token`);
    } else if (error.code !== 'ECONNABORTED') {
      // Don't log timeout errors, they're expected
      console.log(`   ⚠️  Instagram search failed for ${restaurant.name}: ${error.message}`);
    }
  }
  
  // Strategy 2: Try to find Instagram handle from website
  if (restaurant.website) {
    try {
      const response = await axios.get(restaurant.website, {
        timeout: 3000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const $ = cheerio.load(response.data);
      
      // Look for Instagram links in the page
      const instagramLinks = [];
      $('a[href*="instagram.com"]').each((i, el) => {
        const href = $(el).attr('href');
        if (href) {
          const match = href.match(/instagram\.com\/([^\/\?]+)/);
          if (match && match[1] && !match[1].includes('www')) {
            instagramLinks.push(match[1].replace('@', ''));
          }
        }
      });
      
      // Also check for Instagram handle in text
      const pageText = $('body').text();
      const instagramHandleRegex = /@?([a-zA-Z0-9._]+)/g;
      const textMatches = pageText.match(/instagram[^@]*@([a-zA-Z0-9._]+)/gi);
      if (textMatches) {
        textMatches.forEach(match => {
          const handle = match.match(/@([a-zA-Z0-9._]+)/);
          if (handle) instagramLinks.push(handle[1]);
        });
      }
      
      if (instagramLinks.length > 0) {
        const handle = instagramLinks[0];
        return {
          instagramHandle: handle,
          instagramUrl: `https://instagram.com/${handle}`,
          foundVia: 'website_scraping'
        };
      }
    } catch (error) {
      // Website scraping failed, continue
    }
  }
  
  return null;
}

// Batch find Instagram profiles with rate limiting
async function findInstagramProfiles(leads, options = {}) {
  const { batchSize = 5, delay = 2000 } = options;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.log('⚠️  Instagram API not configured - skipping Instagram discovery');
    return leads;
  }
  
  console.log(`\n📱 Finding Instagram profiles...`);
  
  for (let i = 0; i < leads.length; i += batchSize) {
    const batch = leads.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (lead) => {
      // Skip if already has Instagram data
      if (lead.instagram && lead.instagramHandle) {
        return;
      }
      
      try {
        const instagramData = await findInstagramProfile(lead);
        if (instagramData) {
          lead.instagram = instagramData.instagramUrl || lead.instagram;
          lead.instagramHandle = instagramData.instagramHandle;
          lead.instagramId = instagramData.instagramId;
          lead.instagramFollowers = instagramData.followers;
          lead.instagramBio = instagramData.bio;
          lead.facebookPageId = instagramData.facebookPageId;
          lead.facebookPageName = instagramData.facebookPageName;
          
          if (instagramData.website && !lead.website) {
            lead.website = instagramData.website;
          }
        }
      } catch (error) {
        // Continue processing other leads
      }
    }));
    
    // Rate limiting delay
    if (i + batchSize < leads.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  const withInstagram = leads.filter(l => l.instagramHandle).length;
  console.log(`✅ Found ${withInstagram} Instagram profiles`);
  
  return leads;
}

// Scoring system for restaurant qualification
const scoreRestaurant = async (restaurant) => {
  let score = 0;
  const issues = [];
  const maxReviews = parseInt(process.env.MAX_REVIEWS) || 15;
  
  // Soft filter: too many reviews reduces score (but doesn't disqualify)
  // Restaurants with many reviews might still need menu updates
  if (restaurant.totalRatings && restaurant.totalRatings > maxReviews) {
    // Reduce score by 10 points per 100 reviews over the limit
    const excessReviews = restaurant.totalRatings - maxReviews;
    const penalty = Math.min(30, Math.floor(excessReviews / 100) * 10);
    score -= penalty;
    issues.push('many_reviews');
  } else if (restaurant.totalRatings && restaurant.totalRatings <= maxReviews) {
    // Bonus for low review count (indicates less online presence)
    score += 15;
    issues.push('low_review_count');
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
    
    // Build simpler query - just restaurants in the area
    // "independent" keyword is too restrictive and often returns 0 results
    // DoorDash exclusion doesn't work in Places API (that's web search syntax)
    const query = `restaurants ${area}`;
    
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
      console.log(`   🔍 Query: "${query}"`);
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
        params
      });
      
      // Check for API errors
      if (response.data.status && response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        console.error(`   ❌ Google Places API error: ${response.data.status} - ${response.data.error_message || 'Unknown error'}`);
        return [];
      }
      
      if (!response.data.results || response.data.results.length === 0) {
        console.log(`   ⚠️  No results found for query: "${query}"`);
        console.log(`   💡 Try: Different city name, or check if Places API is enabled in Google Cloud`);
        return [];
      }
      
      console.log(`   ✅ Found ${response.data.results.length} places from Google Maps`);
      
      // Filter for independent restaurants if requested (after getting results)
      let results = response.data.results;
      if (targetIndependent) {
        // Filter out chain restaurants by checking for common chain indicators
        const chainIndicators = ['mcdonald', 'burger king', 'subway', 'taco bell', 'kfc', 'pizza hut', 'domino', 'starbucks', 'dunkin', 'wendy', 'chipotle', 'panera', 'olive garden', 'applebees', 'chilis', 'outback', 'red lobster'];
        results = results.filter(place => {
          const nameLower = place.name.toLowerCase();
          return !chainIndicators.some(chain => nameLower.includes(chain));
        });
        console.log(`   🎯 Filtered to ${results.length} independent restaurants`);
      }
      
      const restaurants = await Promise.all(
        results.map(async (place) => {
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
      if (error.response) {
        console.error('   Response status:', error.response.status);
        console.error('   Response data:', JSON.stringify(error.response.data, null, 2));
      }
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
  // Enhanced email finding with multiple strategies
  const { findRestaurantEmails } = require('./improved-email-finder');
  const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
  const excludedPatterns = ['noreply', 'no-reply', 'privacy', 'example.com', 'test.com', 'placeholder', 'sentry', 'monitoring', 'analytics', 'tracking'];
  
  for (const lead of leads) {
    if (!lead.email && lead.website) {
      const foundEmails = new Set();
      
      // Use improved email finder
      try {
        const improvedEmails = await findRestaurantEmails(lead);
        improvedEmails.forEach(e => foundEmails.add(e.toLowerCase()));
      } catch (error) {
        // Fall back to original method
      }
      
      try {
        // Strategy 1: Check main page
        const response = await axios.get(lead.website, {
          timeout: 5000,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        const $ = cheerio.load(response.data);
        
        // Extract emails from text content
        const pageText = $('body').text();
        const pageEmails = (pageText.match(emailRegex) || []);
        pageEmails.forEach(e => foundEmails.add(e.toLowerCase()));
        
        // Extract emails from href attributes (mailto: links)
        $('a[href^="mailto:"]').each((i, el) => {
          const href = $(el).attr('href');
          const email = href.replace('mailto:', '').split('?')[0].trim();
          if (email) foundEmails.add(email.toLowerCase());
        });
        
        // Extract emails from data attributes and hidden fields
        $('[data-email], [data-contact-email], .email, .contact-email').each((i, el) => {
          const text = $(el).text() + ' ' + $(el).attr('data-email') + ' ' + $(el).attr('data-contact-email');
          const emails = (text.match(emailRegex) || []);
          emails.forEach(e => foundEmails.add(e.toLowerCase()));
        });
        
        // Strategy 2: Check footer (common place for contact info)
        const footerText = $('footer').text();
        const footerEmails = (footerText.match(emailRegex) || []);
        footerEmails.forEach(e => foundEmails.add(e.toLowerCase()));
        
        // Strategy 3: Check contact/about pages
        const contactPageUrls = [];
        
        // Find all contact-related links
        $('a[href*="contact"], a[href*="about"], a[href*="reach"], a[href*="connect"]').each((i, el) => {
          let href = $(el).attr('href');
          if (href && !href.startsWith('http') && !href.startsWith('mailto') && !href.startsWith('#')) {
            try {
              const contactUrl = new URL(href, lead.website).href;
              if (!contactPageUrls.includes(contactUrl)) {
                contactPageUrls.push(contactUrl);
              }
            } catch (e) {
              // Invalid URL
            }
          }
        });
        
        // Also try common contact page paths
        const baseUrl = new URL(lead.website);
        const commonPaths = ['/contact', '/contact-us', '/about', '/about-us', '/reach-us', '/get-in-touch'];
        commonPaths.forEach(path => {
          try {
            const contactUrl = new URL(path, lead.website).href;
            if (!contactPageUrls.includes(contactUrl)) {
              contactPageUrls.push(contactUrl);
            }
          } catch (e) {}
        });
        
        // Check up to 3 contact pages
        for (const contactUrl of contactPageUrls.slice(0, 3)) {
          try {
            const contactResponse = await axios.get(contactUrl, { 
              timeout: 3000,
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });
            const contact$ = cheerio.load(contactResponse.data);
            const contactText = contact$.text();
            const contactEmails = (contactText.match(emailRegex) || []);
            contactEmails.forEach(e => foundEmails.add(e.toLowerCase()));
            
            // Also check mailto links on contact page
            contact$('a[href^="mailto:"]').each((i, el) => {
              const href = contact$(el).attr('href');
              const email = href.replace('mailto:', '').split('?')[0].trim();
              if (email) foundEmails.add(email.toLowerCase());
            });
          } catch (e) {
            // Contact page not accessible, skip
          }
        }
        
        // Filter out excluded patterns and find best email
        const validEmails = Array.from(foundEmails).filter(e => {
          const lower = e.toLowerCase();
          return !excludedPatterns.some(pattern => lower.includes(pattern)) &&
                 !lower.includes('support@') &&
                 !lower.includes('help@') &&
                 lower.includes('@') &&
                 lower.split('@')[0].length < 30; // Reasonable length
        });
        
        // Prioritize: info@, contact@, then others
        const contactEmail = validEmails.find(e => 
          e.includes('info@') || e.includes('contact@') || e.includes('hello@')
        ) || validEmails[0];
        
        if (contactEmail) {
          lead.email = contactEmail.toLowerCase();
        } else if (lead.name && lead.website) {
          // Strategy 4: Try common email patterns based on domain
          try {
            const domain = new URL(lead.website).hostname.replace('www.', '');
            const commonEmails = [
              `info@${domain}`,
              `contact@${domain}`,
              `hello@${domain}`,
              `general@${domain}`,
              `inquiries@${domain}`
            ];
            lead.potentialEmails = commonEmails;
          } catch (e) {
            // Invalid URL
          }
        }
      } catch (error) {
        // Website not accessible - try common patterns as fallback
        if (lead.name && lead.website) {
          try {
            const domain = new URL(lead.website).hostname.replace('www.', '');
            const commonEmails = [
              `info@${domain}`,
              `contact@${domain}`,
              `hello@${domain}`
            ];
            lead.potentialEmails = commonEmails;
          } catch (e) {
            // Invalid URL
          }
        }
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
    targetIndependent: process.env.TARGET_INDEPENDENT === 'true', // Default false for broader results
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
  
  // Step 2: Find Instagram profiles
  allLeads = await findInstagramProfiles(allLeads, {
    batchSize: 5,
    delay: 2000
  });
  
  // Step 3: Find emails
  console.log(`\n📧 Finding email addresses...`);
  let leadsWithEmails = await findEmails(allLeads);
  const withEmail = leadsWithEmails.filter(l => l.email).length;
  console.log(`✅ Found ${withEmail} emails`);
  
  // Step 4: Qualify leads (score them)
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
