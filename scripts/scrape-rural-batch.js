require('dotenv').config();
const { scrapeAndQualifyLeads } = require('./scrape-restaurants');
const fs = require('fs').promises;
const path = require('path');

// Helper function to save leads
async function saveLeads(leads, filename = 'leads.json') {
  const dataDir = path.join(__dirname, '..', 'data');
  await fs.mkdir(dataDir, { recursive: true });
  const filePath = path.join(dataDir, filename);
  await fs.writeFile(filePath, JSON.stringify(leads, null, 2));
  console.log(`💾 Saved leads to ${filePath}`);
}

// Rural ZIP codes for batch processing
const RURAL_ZIP_CODES = {
  kansas: [66002, 66006, 66007, 66012, 66013, 66014, 66015, 66016, 66017, 66018, 66020, 66021, 66023, 66024, 66025, 66026, 66027, 66030, 66031, 66032, 66033, 66034, 66035, 66036, 66039, 66040, 66041, 66042, 66043, 66044, 66045, 66046, 66047, 66048, 66049, 66050, 66051, 66052, 66053, 66054, 66056, 66058, 66060, 66061, 66062, 66063, 66064, 66066, 66067, 66070, 66071, 66072, 66073, 66075, 66076, 66077, 66078, 66079, 66080, 66083, 66085, 66086, 66087, 66088, 66090, 66091, 66092, 66093, 66094, 66095, 66097],
  westVirginia: [26801, 26802, 26804, 26807, 26808, 26810, 26811, 26812, 26814, 26815, 26816, 26817, 26818, 26823, 26824, 26833, 26836, 26838, 26845, 26847, 26851, 26852, 26855, 26865, 26866, 26884, 26886]
};

// Rate limiting: Max leads per week (ethical limit)
const MAX_LEADS_PER_WEEK = 100;
const DELAY_BETWEEN_ZIPS = 2000; // 2 seconds between ZIP code searches

async function getZipCodesFromEnv() {
  // Check if ZIP codes are provided in env
  if (process.env.RURAL_ZIP_CODES) {
    try {
      const zips = JSON.parse(process.env.RURAL_ZIP_CODES);
      return Array.isArray(zips) ? zips : [zips];
    } catch (e) {
      // If not JSON, try comma-separated
      return process.env.RURAL_ZIP_CODES.split(',').map(z => z.trim());
    }
  }
  
  // Check for predefined state
  if (process.env.RURAL_STATE === 'kansas') {
    return RURAL_ZIP_CODES.kansas;
  }
  if (process.env.RURAL_STATE === 'westvirginia' || process.env.RURAL_STATE === 'west_virginia') {
    return RURAL_ZIP_CODES.westVirginia;
  }
  
  return [];
}

async function batchScrapeRuralAreas(zipCodes, options = {}) {
  const maxLeads = options.maxLeads || MAX_LEADS_PER_WEEK;
  const delay = options.delay || DELAY_BETWEEN_ZIPS;
  
  console.log(`\n🌾 Starting Rural Area Batch Scraping`);
  console.log(`📋 ZIP Codes to process: ${zipCodes.length}`);
  console.log(`🎯 Target: ${maxLeads} leads/week (ethical limit)`);
  console.log(`⏱️  Delay between searches: ${delay}ms\n`);
  
  const allQualifiedLeads = [];
  const allLeads = [];
  let totalProcessed = 0;
  
  const sources = [];
  if (process.env.GOOGLE_PLACES_API_KEY) sources.push('googleMaps');
  if (process.env.YELP_API_KEY) sources.push('yelp');
  if (process.env.OUTSCRAPER_API_KEY) sources.push('outscraper');
  
  if (sources.length === 0) {
    console.error('❌ No API keys configured');
    process.exit(1);
  }
  
  for (let i = 0; i < zipCodes.length; i++) {
    const zipCode = zipCodes[i];
    
    // Check if we've reached our weekly limit
    if (allQualifiedLeads.length >= maxLeads) {
      console.log(`\n✅ Reached weekly limit of ${maxLeads} qualified leads. Stopping.`);
      break;
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📍 Processing ZIP ${zipCode} (${i + 1}/${zipCodes.length})`);
    console.log(`${'='.repeat(60)}`);
    
    try {
      // Search by ZIP code
      const area = `${zipCode}`;
      const results = await scrapeAndQualifyLeads(area, sources, {
        excludeDoordash: process.env.EXCLUDE_DOORDASH !== 'false',
        targetIndependent: process.env.TARGET_INDEPENDENT !== 'false',
        radius: parseInt(process.env.SEARCH_RADIUS) || 25 // Larger radius for rural areas
      });
      
      // Deduplicate against existing leads
      const existingNames = new Set(allLeads.map(l => `${l.name}-${l.address}`.toLowerCase()));
      
      results.all.forEach(lead => {
        const key = `${lead.name}-${lead.address}`.toLowerCase();
        if (!existingNames.has(key)) {
          allLeads.push(lead);
          existingNames.add(key);
        }
      });
      
      results.qualified.forEach(lead => {
        const key = `${lead.name}-${lead.address}`.toLowerCase();
        if (!existingNames.has(key)) {
          allQualifiedLeads.push(lead);
        }
      });
      
      totalProcessed++;
      
      console.log(`\n📊 Progress:`);
      console.log(`   Total leads found: ${allLeads.length}`);
      console.log(`   Qualified leads: ${allQualifiedLeads.length}/${maxLeads}`);
      
      // Rate limiting: wait between ZIP codes
      if (i < zipCodes.length - 1 && allQualifiedLeads.length < maxLeads) {
        console.log(`\n⏳ Waiting ${delay}ms before next ZIP code...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
    } catch (error) {
      console.error(`❌ Error processing ZIP ${zipCode}:`, error.message);
      // Continue with next ZIP code
    }
  }
  
  // Sort qualified leads by score
  allQualifiedLeads.sort((a, b) => b.qualificationScore - a.qualificationScore);
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎉 BATCH SCRAPING COMPLETE`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📋 ZIP Codes processed: ${totalProcessed}`);
  console.log(`📊 Total leads found: ${allLeads.length}`);
  console.log(`✨ Qualified leads: ${allQualifiedLeads.length}`);
  console.log(`${'='.repeat(60)}\n`);
  
  return {
    all: allLeads,
    qualified: allQualifiedLeads,
    zipCodesProcessed: totalProcessed
  };
}

async function main() {
  const zipCodes = await getZipCodesFromEnv();
  
  if (zipCodes.length === 0) {
    console.error('❌ No ZIP codes configured.');
    console.log('\n💡 Set RURAL_ZIP_CODES in .env:');
    console.log('   RURAL_ZIP_CODES=[66002,26801,66006]');
    console.log('\n   OR use predefined states:');
    console.log('   RURAL_STATE=kansas');
    console.log('   RURAL_STATE=westvirginia');
    process.exit(1);
  }
  
  console.log(`\n🌾 Rural Area Batch Scraping`);
  console.log(`📋 ZIP Codes: ${zipCodes.slice(0, 10).join(', ')}${zipCodes.length > 10 ? '...' : ''} (${zipCodes.length} total)`);
  
  const results = await batchScrapeRuralAreas(zipCodes, {
    maxLeads: parseInt(process.env.MAX_LEADS_PER_WEEK) || MAX_LEADS_PER_WEEK,
    delay: parseInt(process.env.DELAY_BETWEEN_ZIPS) || DELAY_BETWEEN_ZIPS
  });
  
  // Save results
  const timestamp = new Date().toISOString().split('T')[0];
  await saveLeads(results.all, `rural-all-leads-${timestamp}.json`);
  await saveLeads(results.qualified, `rural-qualified-leads-${timestamp}.json`);
  
  // Also update main files
  await saveLeads(results.all, 'all-leads.json');
  await saveLeads(results.qualified, 'qualified-leads.json');
  
  console.log(`\n💾 Results saved:`);
  console.log(`   - data/rural-all-leads-${timestamp}.json`);
  console.log(`   - data/rural-qualified-leads-${timestamp}.json`);
  console.log(`   - data/all-leads.json (updated)`);
  console.log(`   - data/qualified-leads.json (updated)\n`);
  
  // Ethical reminder
  console.log(`\n📝 Ethical Note:`);
  console.log(`   ✅ Only public data sources used`);
  console.log(`   ✅ Respectful rate limiting applied`);
  console.log(`   ✅ Weekly limit: ${results.qualified.length}/${MAX_LEADS_PER_WEEK} leads`);
  console.log(`   ✅ All data from publicly available APIs\n`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { batchScrapeRuralAreas, RURAL_ZIP_CODES };
