require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { scoreRestaurant, findEmails } = require('./scrape-restaurants');

async function reQualifyLeads() {
  console.log('🔄 Re-qualifying existing leads with updated scoring...\n');
  
  const dataDir = path.join(__dirname, '..', 'data');
  const allLeadsPath = path.join(dataDir, 'all-leads.json');
  
  try {
    const data = await fs.readFile(allLeadsPath, 'utf8');
    const allLeads = JSON.parse(data);
    
    console.log(`📊 Found ${allLeads.length} leads to re-qualify\n`);
    
    // Step 1: Find emails for leads that don't have them
    console.log('📧 Finding missing emails...');
    const leadsNeedingEmails = allLeads.filter(l => !l.email);
    if (leadsNeedingEmails.length > 0) {
      const updatedLeads = await findEmails(leadsNeedingEmails);
      // Merge back
      const emailMap = new Map(updatedLeads.map(l => [l.placeId || l.name, l]));
      allLeads.forEach(lead => {
        const updated = emailMap.get(lead.placeId || lead.name);
        if (updated && updated.email) {
          lead.email = updated.email;
          lead.potentialEmails = updated.potentialEmails;
        }
      });
    }
    
    // Step 2: Re-score all leads
    console.log('\n🎯 Re-scoring leads...');
    const qualifiedLeads = [];
    
    for (let i = 0; i < allLeads.length; i++) {
      const lead = allLeads[i];
      process.stdout.write(`\r   Processing ${i + 1}/${allLeads.length}...`);
      
      const scored = await scoreRestaurant(lead);
      if (scored.isQualified) {
        qualifiedLeads.push(scored);
      }
      // Update the lead in place
      allLeads[i] = scored;
    }
    process.stdout.write('\n');
    
    // Sort by qualification score
    qualifiedLeads.sort((a, b) => b.qualificationScore - a.qualificationScore);
    
    console.log(`\n✨ Qualified leads (score >= ${process.env.QUALIFICATION_THRESHOLD || 40}): ${qualifiedLeads.length}`);
    
    if (qualifiedLeads.length > 0) {
      console.log(`\n📋 Top 10 Qualified Leads:`);
      qualifiedLeads.slice(0, 10).forEach((lead, i) => {
        console.log(`   ${i + 1}. ${lead.name} - Score: ${lead.qualificationScore} - Issues: ${lead.issues.join(', ')}`);
      });
    } else {
      console.log('\n⚠️  No qualified leads found. Try:');
      console.log('   - Lowering QUALIFICATION_THRESHOLD in .env (default: 40)');
      console.log('   - Increasing MAX_REVIEWS in .env (default: 15)');
    }
    
    // Save updated leads
    await fs.writeFile(allLeadsPath, JSON.stringify(allLeads, null, 2));
    await fs.writeFile(
      path.join(dataDir, 'qualified-leads.json'),
      JSON.stringify(qualifiedLeads, null, 2)
    );
    
    console.log(`\n💾 Saved ${qualifiedLeads.length} qualified leads to data/qualified-leads.json`);
    
    return { all: allLeads, qualified: qualifiedLeads };
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ENOENT') {
      console.error('   Run "npm run scrape" first to generate leads');
    }
    process.exit(1);
  }
}

if (require.main === module) {
  reQualifyLeads().catch(console.error);
}

module.exports = { reQualifyLeads };
