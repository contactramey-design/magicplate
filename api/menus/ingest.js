// Menu Ingestion API - Handles PDF, photo, text uploads
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { findById } = require('../../lib/db');
const aiGateway = require('../../lib/ai-gateway');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * POST /api/menus/ingest
 * Ingest menu from PDF, photo, or text
 */
router.post('/', upload.single('menu_file'), async (req, res) => {
  try {
    const { restaurant_id, source_type, text_content } = req.body;
    const file = req.file;

    if (!restaurant_id) {
      return res.status(400).json({ error: 'restaurant_id is required' });
    }

    const restaurant = await findById('restaurants', parseInt(restaurant_id), 'restaurant_id');
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    let menuItems = [];
    let ingestionMethod = 'unknown';

    // Handle different source types
    if (source_type === 'text' && text_content) {
      // Text-based menu ingestion
      menuItems = await parseTextMenu(text_content, restaurant);
      ingestionMethod = 'text';
    } else if (file) {
      // File-based ingestion (PDF or image)
      const fileType = file.mimetype;
      
      if (fileType === 'application/pdf') {
        menuItems = await parsePDFMenu(file.buffer, restaurant);
        ingestionMethod = 'pdf';
      } else if (fileType.startsWith('image/')) {
        menuItems = await parseImageMenu(file.buffer, restaurant);
        ingestionMethod = 'image';
      } else {
        return res.status(400).json({ error: 'Unsupported file type. Use PDF or image.' });
      }
    } else {
      return res.status(400).json({ error: 'Either file upload or text_content is required' });
    }

    // Analyze and enrich menu items with AI
    const enrichedItems = [];
    for (const item of menuItems) {
      if (aiGateway.isConfigured()) {
        try {
          const enriched = await aiGateway.analyzeMenuItem(item, restaurant);
          enrichedItems.push(enriched);
        } catch (error) {
          console.error('Error enriching item:', error);
          enrichedItems.push(item);
        }
      } else {
        enrichedItems.push(item);
      }
    }

    res.json({
      success: true,
      restaurant_id: parseInt(restaurant_id),
      ingestion_method: ingestionMethod,
      items_extracted: menuItems.length,
      items_enriched: enrichedItems.filter(i => i.ai_analyzed).length,
      menu_items: enrichedItems
    });
  } catch (error) {
    console.error('Error ingesting menu:', error);
    res.status(500).json({ error: 'Failed to ingest menu', details: error.message });
  }
});

/**
 * Parse text-based menu
 */
async function parseTextMenu(text, restaurant) {
  // Simple text parsing - split by lines and identify items
  const lines = text.split('\n').filter(line => line.trim());
  const items = [];
  
  for (const line of lines) {
    // Try to extract name, price, description
    const priceMatch = line.match(/\$?(\d+\.?\d*)/);
    const price = priceMatch ? parseFloat(priceMatch[1]) : null;
    
    // Remove price from line to get name/description
    const nameDesc = line.replace(/\$?\d+\.?\d*/, '').trim();
    const parts = nameDesc.split(/[–—\-]/);
    
    items.push({
      name: parts[0]?.trim() || nameDesc,
      description: parts[1]?.trim() || '',
      price: price,
      category: 'Main',
      raw_text: line
    });
  }
  
  return items;
}

/**
 * Parse PDF menu (placeholder - would need PDF parsing library)
 */
async function parsePDFMenu(buffer, restaurant) {
  // TODO: Implement PDF parsing using pdf-parse or similar
  // For now, return placeholder
  return [{
    name: 'PDF Menu Item',
    description: 'Extracted from PDF',
    price: null,
    category: 'Main',
    note: 'PDF parsing requires additional library (pdf-parse)'
  }];
}

/**
 * Parse image menu using OCR (placeholder - would need OCR service)
 */
async function parseImageMenu(buffer, restaurant) {
  // TODO: Implement OCR using Tesseract.js or cloud OCR service
  // For now, return placeholder
  return [{
    name: 'Image Menu Item',
    description: 'Extracted from image via OCR',
    price: null,
    category: 'Main',
    note: 'Image OCR requires additional service (Tesseract.js or cloud OCR)'
  }];
}

module.exports = router;
