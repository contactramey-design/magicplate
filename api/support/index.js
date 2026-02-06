// Support API Routes
const express = require('express');
const router = express.Router();
const { createTicket, listTickets } = require('./tickets');

// POST /api/support/tickets - Create support ticket
router.post('/tickets', async (req, res) => {
  try {
    const { restaurant_id, subject, message, priority, category } = req.body;
    
    if (!restaurant_id || !subject || !message) {
      return res.status(400).json({ error: 'restaurant_id, subject, and message are required' });
    }
    
    const ticket = await createTicket({
      restaurant_id,
      subject,
      message,
      priority: priority || 'medium',
      category: category || 'general'
    });
    
    res.json({
      ...ticket,
      message: 'Support ticket created successfully. We\'ll respond within 24 hours.'
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: error.message || 'Failed to create support ticket' });
  }
});

// GET /api/support/tickets/:restaurant_id - List tickets
router.get('/tickets/:restaurant_id', async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    const tickets = await listTickets(restaurant_id);
    
    res.json({
      restaurant_id: parseInt(restaurant_id),
      tickets,
      total: tickets.length
    });
  } catch (error) {
    console.error('Error listing tickets:', error);
    res.status(500).json({ error: 'Failed to list tickets' });
  }
});

module.exports = router;
