// Subscription Signup API
// Handles new subscription signups with restaurant creation

const { insert, findAll } = require('../../lib/db');
const { setupRestaurantAvatar } = require('../../scripts/setup-restaurant-avatar');

// POST /api/subscriptions/signup - Complete signup workflow
module.exports = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      website, 
      tier, 
      billing_cycle = 'monthly',
      setup_avatar = false,
      create_welcome_video = false,
      restaurant_name,
      address,
      city,
      state,
      zip_code
    } = req.body;
    
    // Validation
    if (!name || !email || !tier) {
      return res.status(400).json({ error: 'name, email, and tier are required' });
    }
    
    if (!['starter', 'professional', 'enterprise'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier. Must be starter, professional, or enterprise' });
    }
    
    // Step 1: Create restaurant
    const restaurant = await insert('restaurants', {
      name: restaurant_name || name,
      email,
      phone: phone || null,
      website: website || null,
      subscription_tier: tier,
      location_count: 1,
      status: 'active'
    });
    
    // Step 2: Create subscription
    const renewalDate = new Date();
    if (billing_cycle === 'monthly') {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    } else if (billing_cycle === 'annual') {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    }
    
    const subscription = await insert('subscriptions', {
      restaurant_id: restaurant.restaurant_id,
      tier,
      status: 'active',
      billing_cycle,
      renewal_date: renewalDate.toISOString()
    });
    
    // Step 3: Create first location if address provided
    let location = null;
    if (address) {
      location = await insert('locations', {
        restaurant_id: restaurant.restaurant_id,
        name: `${restaurant.name} - Main Location`,
        address,
        city: city || null,
        state: state || null,
        zip_code: zip_code || null
      });
    }
    
    // Step 4: Create brand guidelines
    const guidelines = await insert('brand_guidelines', {
      restaurant_id: restaurant.restaurant_id,
      colors: { primary: '#4caf50', secondary: '#66bb6a', accent: '#ffffff' },
      fonts: { heading: 'Inter', body: 'Inter' },
      tone: 'professional'
    });
    
    // Step 5: Set up HeyGen avatar if requested (Professional/Enterprise)
    let avatarResult = null;
    if (setup_avatar && (tier === 'professional' || tier === 'enterprise')) {
      try {
        avatarResult = await setupRestaurantAvatar({
          restaurant_id: restaurant.restaurant_id,
          restaurant_name: restaurant.name,
          base_avatar_id: process.env.HEYGEN_BASE_AVATAR_ID,
          create_welcome_video: create_welcome_video
        });
      } catch (error) {
        console.error('Avatar setup error:', error);
        // Continue without avatar - can be set up later
      }
    }
    
    // TODO: Integrate with Stripe for payment processing
    // const stripeCustomer = await stripe.customers.create({ email, name });
    // const stripeSubscription = await stripe.subscriptions.create({...});
    
    res.json({
      success: true,
      restaurant: {
        restaurant_id: restaurant.restaurant_id,
        name: restaurant.name,
        email: restaurant.email,
        subscription_tier: restaurant.subscription_tier
      },
      subscription: {
        subscription_id: subscription.subscription_id,
        tier: subscription.tier,
        status: subscription.status,
        billing_cycle: subscription.billing_cycle,
        renewal_date: subscription.renewal_date
      },
      location: location ? {
        location_id: location.location_id,
        name: location.name,
        address: location.address
      } : null,
      avatar: avatarResult?.avatar || null,
      welcome_video: avatarResult?.welcome_video || null,
      message: 'Subscription created successfully! Welcome to MagicPlate.ai',
      next_steps: [
        'Check your email for onboarding instructions',
        'Set up your brand guidelines',
        'Upload your first menu photos',
        setup_avatar ? 'Your HeyGen avatar is being created' : 'Set up your HeyGen avatar in settings'
      ]
    });
  } catch (error) {
    console.error('Error in subscription signup:', error);
    res.status(500).json({ error: 'Failed to create subscription', details: error.message });
  }
};
