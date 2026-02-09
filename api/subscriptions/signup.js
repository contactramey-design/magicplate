// Purchase Signup API
// Handles one-time purchases with restaurant creation

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
      billing_cycle = 'one-time',
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
    
    // Step 2: Create purchase record (one-time payment model)
    // Note: billing_cycle is now 'one-time' for all purchases
    const purchaseDate = new Date();
    
    const subscription = await insert('subscriptions', {
      restaurant_id: restaurant.restaurant_id,
      tier,
      status: 'active',
      billing_cycle: 'one-time', // All purchases are one-time
      renewal_date: null, // No renewal for one-time purchases
      purchase_date: purchaseDate.toISOString(),
      payment_type: 'one-time'
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
    
    // TODO: Integrate with Stripe for one-time payment processing
    // For one-time payments, use Stripe Checkout Sessions:
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: [{
    //     price_data: {
    //       currency: 'usd',
    //       product_data: { name: `${tier} Plan - One-Time Purchase` },
    //       unit_amount: tier === 'starter' ? 9900 : tier === 'professional' ? 29900 : 79900, // $99, $299, $799
    //     },
    //     quantity: 1,
    //   }],
    //   mode: 'payment', // One-time payment, not subscription
    //   success_url: `${process.env.BASE_URL}/dashboard.html?tier=${tier}&purchase=success`,
    //   cancel_url: `${process.env.BASE_URL}/#pricing`,
    //   customer_email: email,
    // });
    // return res.json({ sessionId: session.id, url: session.url });
    
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
      message: 'Purchase successful! Welcome to MagicPlate.ai - You now have lifetime access!',
      next_steps: [
        'Check your email for onboarding instructions',
        'Set up your brand guidelines',
        'Upload your first menu photos',
        setup_avatar ? 'Your HeyGen avatar is being created' : 'Set up your HeyGen avatar in settings'
      ]
    });
  } catch (error) {
    console.error('Error in subscription signup:', error);
    res.status(500).json({ error: 'Failed to process purchase', details: error.message });
  }
};
