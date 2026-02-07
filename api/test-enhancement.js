// Test endpoint to diagnose enhancement issues
const { getAIGatewayPrompt } = require('../lib/photo-enhancement-prompt');

module.exports = async (req, res) => {
  try {
    // Test prompt generation
    const prompt = getAIGatewayPrompt('upscale_casual');
    
    // Check API keys
    const hasLeonardo = !!process.env.LEONARDO_API_KEY;
    const hasTogether = !!process.env.TOGETHER_API_KEY;
    const hasReplicate = !!process.env.REPLICATE_API_TOKEN;
    
    // Check database
    let dbStatus = 'unknown';
    try {
      const { getDB } = require('../lib/db');
      const db = getDB();
      if (db) {
        dbStatus = 'connected';
      }
    } catch (dbError) {
      dbStatus = `error: ${dbError.message}`;
    }
    
    res.json({
      status: 'ok',
      prompt: {
        generated: true,
        length: prompt.length,
        preview: prompt.substring(0, 100) + '...'
      },
      apiKeys: {
        leonardo: hasLeonardo,
        together: hasTogether,
        replicate: hasReplicate,
        anyConfigured: hasLeonardo || hasTogether || hasReplicate
      },
      database: {
        status: dbStatus
      },
      message: hasLeonardo || hasTogether || hasReplicate 
        ? 'API keys configured. Enhancement should work.'
        : 'No API keys configured. Please add LEONARDO_API_KEY, TOGETHER_API_KEY, or REPLICATE_API_TOKEN to .env'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      stack: error.stack
    });
  }
};
