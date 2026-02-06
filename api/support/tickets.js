// Support Ticket System
// Handles support requests and ticket management

const { insert, findById, findAll, update } = require('../../lib/db');
const { sendEmail } = require('../../config/email-config');

/**
 * Create a support ticket
 * @param {Object} params - Ticket parameters
 * @param {number} params.restaurant_id - Restaurant ID
 * @param {string} params.subject - Ticket subject
 * @param {string} params.message - Ticket message
 * @param {string} params.priority - Priority (low, medium, high, urgent)
 * @param {string} params.category - Category (technical, billing, feature_request, etc.)
 * @returns {Promise<Object>} Created ticket
 */
async function createTicket({ restaurant_id, subject, message, priority = 'medium', category = 'general' }) {
  // Get restaurant info
  const restaurant = await findById('restaurants', restaurant_id, 'restaurant_id');
  if (!restaurant) {
    throw new Error('Restaurant not found');
  }
  
  // Get subscription tier for priority handling
  const subscriptions = await findAll('subscriptions', {
    restaurant_id: parseInt(restaurant_id),
    status: 'active'
  });
  
  const subscription = subscriptions[0];
  const tier = subscription?.tier || 'starter';
  
  // Adjust priority based on tier
  let finalPriority = priority;
  if (tier === 'enterprise' && priority === 'medium') {
    finalPriority = 'high'; // Enterprise gets higher priority
  } else if (tier === 'professional' && priority === 'low') {
    finalPriority = 'medium'; // Professional gets medium priority
  }
  
  // Create ticket (using content_assets table with type 'support_ticket' or create tickets table)
  // For now, we'll store in a simple format
  const ticket = {
    restaurant_id: parseInt(restaurant_id),
    subject,
    message,
    priority: finalPriority,
    category,
    status: 'open',
    tier,
    created_at: new Date().toISOString()
  };
  
  // TODO: Store in support_tickets table (add to schema)
  // For now, send email notification
  try {
    await sendEmail({
      to: 'sydney@magicplate.info',
      from: {
        email: process.env.FROM_EMAIL || 'sydney@magicplate.info',
        name: 'MagicPlate Support System'
      },
      subject: `[${finalPriority.toUpperCase()}] Support Ticket: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
          <h2>New Support Ticket</h2>
          <p><strong>Restaurant:</strong> ${restaurant.name} (ID: ${restaurant_id})</p>
          <p><strong>Tier:</strong> ${tier}</p>
          <p><strong>Priority:</strong> ${finalPriority}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
      `,
      text: `New Support Ticket\n\nRestaurant: ${restaurant.name}\nTier: ${tier}\nPriority: ${finalPriority}\nSubject: ${subject}\n\nMessage:\n${message}`
    });
  } catch (emailError) {
    console.error('Error sending support email:', emailError);
    // Continue even if email fails
  }
  
  return ticket;
}

/**
 * List tickets for a restaurant
 */
async function listTickets(restaurant_id) {
  // TODO: Query from support_tickets table
  // For now, return empty array
  return [];
}

module.exports = {
  createTicket,
  listTickets
};
