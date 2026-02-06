// Automated Restaurant Avatar Setup Script
// Sets up HeyGen avatar for a restaurant during onboarding

const { createRestaurantAvatar } = require('../api/heygen/create-avatar');
const { generateWelcomeVideo } = require('../api/heygen/generate-video');

/**
 * Complete avatar setup workflow for a restaurant
 * @param {Object} params - Setup parameters
 * @param {string} params.restaurant_id - Restaurant ID
 * @param {string} params.restaurant_name - Restaurant name
 * @param {string} params.base_avatar_id - Base avatar ID to clone from (Sydney's avatar)
 * @param {boolean} params.create_welcome_video - Whether to create welcome video
 */
async function setupRestaurantAvatar({ 
  restaurant_id, 
  restaurant_name, 
  base_avatar_id = null,
  create_welcome_video = true 
}) {
  console.log(`\n🎬 Setting up avatar for restaurant: ${restaurant_name} (ID: ${restaurant_id})`);
  
  try {
    // Step 1: Create avatar
    console.log('   Step 1: Creating avatar...');
    const avatarResult = await createRestaurantAvatar({
      restaurant_id,
      avatar_name: `${restaurant_name} Avatar`,
      base_avatar_id: base_avatar_id || process.env.HEYGEN_BASE_AVATAR_ID
    });
    
    if (!avatarResult.success) {
      throw new Error(avatarResult.message || 'Failed to create avatar');
    }
    
    console.log(`   ✅ Avatar created: ${avatarResult.avatar_id}`);
    
    // Step 2: Store avatar in database
    // TODO: Save to heygen_avatars table
    const avatar_id = avatarResult.avatar_id;
    
    // Step 3: Generate welcome video (if requested)
    if (create_welcome_video) {
      console.log('   Step 2: Generating welcome video...');
      const videoResult = await generateWelcomeVideo({
        restaurant_id,
        restaurant_name,
        avatar_id
      });
      
      console.log(`   ✅ Welcome video generated: ${videoResult.video_id}`);
      
      // TODO: Store video in content_assets table
      // TODO: Update avatar record with video reference
      
      return {
        success: true,
        restaurant_id,
        avatar: avatarResult,
        welcome_video: videoResult,
        message: 'Avatar setup completed successfully'
      };
    }
    
    return {
      success: true,
      restaurant_id,
      avatar: avatarResult,
      message: 'Avatar created successfully (welcome video skipped)'
    };
    
  } catch (error) {
    console.error(`   ❌ Error setting up avatar: ${error.message}`);
    throw error;
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node scripts/setup-restaurant-avatar.js <restaurant_id> <restaurant_name> [base_avatar_id]');
    process.exit(1);
  }
  
  const [restaurant_id, restaurant_name, base_avatar_id] = args;
  
  setupRestaurantAvatar({
    restaurant_id,
    restaurant_name,
    base_avatar_id: base_avatar_id || null,
    create_welcome_video: true
  })
    .then(result => {
      console.log('\n✅ Setup complete!');
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Setup failed:', error.message);
      process.exit(1);
    });
}

module.exports = { setupRestaurantAvatar };
