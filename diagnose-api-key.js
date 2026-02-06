#!/usr/bin/env node
/**
 * Diagnostic script to test Google Places API key
 * This will help identify if the API key is working correctly
 */

require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

console.log('🔍 Google Places API Key Diagnostic\n');
console.log('=' .repeat(50));

// Check 1: Is the key set?
console.log('\n1️⃣  Checking if API key is set...');
if (!API_KEY) {
  console.log('   ❌ GOOGLE_PLACES_API_KEY is NOT set in .env');
  console.log('   💡 Add it to your .env file');
  process.exit(1);
}
console.log(`   ✅ API Key is set`);
console.log(`   📋 Key preview: ${API_KEY.substring(0, 20)}...${API_KEY.substring(API_KEY.length - 4)}`);
console.log(`   📏 Key length: ${API_KEY.length} characters`);

// Check 2: Test the API key with a simple request
console.log('\n2️⃣  Testing API key with Google Places API...');
console.log('   🔍 Query: "restaurants Kansas City, MO"');

const testQuery = async () => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: {
        query: 'restaurants Kansas City, MO',
        key: API_KEY,
        type: 'restaurant'
      },
      timeout: 10000
    });

    console.log(`   📊 Response status: ${response.data.status}`);
    
    if (response.data.status === 'OK') {
      console.log(`   ✅ SUCCESS! API key is working`);
      console.log(`   📍 Found ${response.data.results?.length || 0} results`);
      if (response.data.results && response.data.results.length > 0) {
        console.log(`   🏪 First result: ${response.data.results[0].name}`);
      }
      return true;
    } else if (response.data.status === 'REQUEST_DENIED') {
      console.log(`   ❌ REQUEST_DENIED error`);
      console.log(`   📝 Error message: ${response.data.error_message || 'No error message'}`);
      
      if (response.data.error_message?.includes('billing')) {
        console.log('\n   💡 BILLING ISSUE DETECTED:');
        console.log('      - Billing account might not be linked to the project');
        console.log('      - Or billing was just enabled and needs time to propagate');
        console.log('      - Check: https://console.cloud.google.com/billing');
      } else if (response.data.error_message?.includes('API key')) {
        console.log('\n   💡 API KEY ISSUE:');
        console.log('      - API key might be invalid');
        console.log('      - Or key might have restrictions blocking Places API');
        console.log('      - Check: https://console.cloud.google.com/apis/credentials');
      }
      return false;
    } else if (response.data.status === 'ZERO_RESULTS') {
      console.log(`   ⚠️  ZERO_RESULTS - API key works but no results found`);
      console.log(`   💡 This is normal - the query might be too specific`);
      return true; // Key works, just no results
    } else {
      console.log(`   ⚠️  Unexpected status: ${response.data.status}`);
      console.log(`   📝 Message: ${response.data.error_message || 'No message'}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Network/Request error: ${error.message}`);
    if (error.response) {
      console.log(`   📊 HTTP Status: ${error.response.status}`);
      console.log(`   📝 Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return false;
  }
};

// Run the test
testQuery().then(success => {
  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('\n✅ API Key Diagnostic: PASSED');
    console.log('   Your API key is working correctly!');
    console.log('   If Vercel still shows errors, check:');
    console.log('   1. API key in Vercel matches this one');
    console.log('   2. Vercel environment variables are saved');
    console.log('   3. Vercel deployment has been redeployed');
  } else {
    console.log('\n❌ API Key Diagnostic: FAILED');
    console.log('   Follow the suggestions above to fix the issue.');
  }
  console.log('');
});
