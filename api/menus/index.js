// Digital Menu Management API Routes
const express = require('express');
const router = express.Router();
const { createMenu, getMenu, listMenus, updateMenu, deleteMenu } = require('./create');

// POST /api/menus - Create new menu
router.post('/', async (req, res) => {
  try {
    const { restaurant_id, name, items, settings } = req.body;
    
    if (!restaurant_id || !name) {
      return res.status(400).json({ error: 'restaurant_id and name are required' });
    }
    
    const menu = await createMenu({
      restaurant_id,
      name,
      items: items || [],
      settings: settings || {}
    });
    
    res.json({
      ...menu,
      message: 'Menu created successfully'
    });
  } catch (error) {
    console.error('Error creating menu:', error);
    res.status(500).json({ error: error.message || 'Failed to create menu' });
  }
});

// GET /api/menus/:restaurant_id - List all menus for restaurant
router.get('/:restaurant_id', async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    const menus = await listMenus(restaurant_id);
    
    res.json({
      restaurant_id: parseInt(restaurant_id),
      menus,
      total: menus.length
    });
  } catch (error) {
    console.error('Error listing menus:', error);
    res.status(500).json({ error: 'Failed to list menus' });
  }
});

// GET /api/menus/menu/:menu_id - Get menu details
router.get('/menu/:menu_id', async (req, res) => {
  try {
    const { menu_id } = req.params;
    const menu = await getMenu(menu_id);
    res.json(menu);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(404).json({ error: error.message || 'Menu not found' });
  }
});

// PUT /api/menus/:menu_id - Update menu
router.put('/:menu_id', async (req, res) => {
  try {
    const { menu_id } = req.params;
    const updates = req.body;
    
    const menu = await updateMenu(menu_id, updates);
    res.json({
      ...menu,
      message: 'Menu updated successfully'
    });
  } catch (error) {
    console.error('Error updating menu:', error);
    res.status(500).json({ error: error.message || 'Failed to update menu' });
  }
});

// DELETE /api/menus/:menu_id - Delete menu
router.delete('/:menu_id', async (req, res) => {
  try {
    const { menu_id } = req.params;
    await deleteMenu(menu_id);
    res.json({ message: 'Menu deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu:', error);
    res.status(500).json({ error: error.message || 'Failed to delete menu' });
  }
});

// POST /api/menus/generate-description - Generate menu description using AI
router.post('/generate-description', require('./generate-description'));

// POST /api/menus/seo-optimize - Batch SEO optimization for menu items
router.post('/seo-optimize', require('./seo-optimize'));

module.exports = router;
