// Brand Guidelines Management
// Handles CRUD operations for brand guidelines

const { findById, findAll, insert, update } = require('../../lib/db');

// GET brand guidelines for a restaurant
async function getBrandGuidelines(restaurant_id) {
  const guidelines = await findAll('brand_guidelines', { restaurant_id: parseInt(restaurant_id) });
  
  if (guidelines.length === 0) {
    // Return default guidelines if none exist
    return {
      restaurant_id: parseInt(restaurant_id),
      colors: {
        primary: '#4caf50',
        secondary: '#66bb6a',
        accent: '#ffffff'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter'
      },
      logo_url: null,
      tone: 'professional',
      style_guide: {}
    };
  }
  
  return guidelines[0];
}

// UPDATE brand guidelines
async function updateBrandGuidelines(restaurant_id, guidelines) {
  const existing = await findAll('brand_guidelines', { restaurant_id: parseInt(restaurant_id) });
  
  if (existing.length === 0) {
    // Create new guidelines
    return await insert('brand_guidelines', {
      restaurant_id: parseInt(restaurant_id),
      colors: guidelines.colors || {},
      fonts: guidelines.fonts || {},
      logo_url: guidelines.logo_url || null,
      tone: guidelines.tone || 'professional',
      style_guide: guidelines.style_guide || {}
    });
  }
  
  // Update existing guidelines
  return await update('brand_guidelines', existing[0].guideline_id, guidelines, 'guideline_id');
}

// VALIDATE content against brand guidelines
async function validateContent(restaurant_id, content) {
  const guidelines = await getBrandGuidelines(restaurant_id);
  
  // Basic validation logic
  const violations = [];
  
  // Check colors
  if (content.colors) {
    // Validate against brand colors
  }
  
  // Check fonts
  if (content.fonts) {
    // Validate against brand fonts
  }
  
  // Check tone
  if (content.tone && content.tone !== guidelines.tone) {
    violations.push({
      type: 'tone',
      message: `Content tone doesn't match brand tone: ${guidelines.tone}`
    });
  }
  
  return {
    valid: violations.length === 0,
    violations,
    guidelines
  };
}

module.exports = {
  getBrandGuidelines,
  updateBrandGuidelines,
  validateContent
};
