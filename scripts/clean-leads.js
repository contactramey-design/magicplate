require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

async function cleanLeads() {
  console.log('🧹 Cleaning leads data...\n');
  
  const dataDir = path.join(__dirname, '..', 'data');
  const allLeadsPath = path.join(dataDir, 'all-leads.json');
  
  try {
    const data = await fs.readFile(allLeadsPath, 'utf8');
    let leads = JSON.parse(data);
    
    console.log(`📊 Original leads count: ${leads.length}`);
    
    // Remove duplicates by placeId (or name + address if no placeId)
    const seen = new Map();
    const cleaned = [];
    let duplicates = 0;
    let invalid = 0;
    
    for (const lead of leads) {
      // Skip invalid entries
      if (!lead.name || (!lead.address && !lead.placeId)) {
        invalid++;
        continue;
      }
      
      // Create unique key
      const key = lead.placeId || `${lead.name}|${lead.address}`;
      
      if (seen.has(key)) {
        duplicates++;
        // Keep the one with more data
        const existing = seen.get(key);
        const existingData = JSON.stringify(existing).length;
        const newData = JSON.stringify(lead).length;
        
        if (newData > existingData) {
          // Replace with more complete entry
          const index = cleaned.findIndex(l => 
            (l.placeId || `${l.name}|${l.address}`) === key
          );
          if (index !== -1) {
            cleaned[index] = lead;
          }
        }
      } else {
        seen.set(key, lead);
        cleaned.push(lead);
      }
    }
    
    // Sort by name for easier reading
    cleaned.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    
    // Remove null/undefined fields to clean up the JSON
    const sanitized = cleaned.map(lead => {
      const clean = {};
      for (const [key, value] of Object.entries(lead)) {
        if (value !== null && value !== undefined && value !== '') {
          clean[key] = value;
        }
      }
      return clean;
    });
    
    console.log(`✅ Cleaned leads count: ${sanitized.length}`);
    console.log(`🗑️  Removed duplicates: ${duplicates}`);
    console.log(`❌ Removed invalid: ${invalid}`);
    
    // Backup original
    const backupPath = path.join(dataDir, `all-leads.backup.${Date.now()}.json`);
    await fs.writeFile(backupPath, data);
    console.log(`💾 Backup saved to: ${path.basename(backupPath)}`);
    
    // Save cleaned version
    await fs.writeFile(allLeadsPath, JSON.stringify(sanitized, null, 2));
    console.log(`💾 Cleaned leads saved to: all-leads.json\n`);
    
    // Show summary
    const withEmail = sanitized.filter(l => l.email).length;
    const qualified = sanitized.filter(l => l.isQualified).length;
    
    console.log(`📊 Summary:`);
    console.log(`   Total leads: ${sanitized.length}`);
    console.log(`   With email: ${withEmail}`);
    console.log(`   Qualified: ${qualified}`);
    
    return sanitized;
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ENOENT') {
      console.error('   File not found. Run "npm run scrape" first.');
    }
    process.exit(1);
  }
}

if (require.main === module) {
  cleanLeads().catch(console.error);
}

module.exports = { cleanLeads };
