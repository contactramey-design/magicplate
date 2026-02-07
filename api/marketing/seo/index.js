// SEO Marketing API Routes
const express = require('express');
const router = express.Router();

// Import SEO sub-routers
const googleBusinessRouter = require('./google-business');
const citationsRouter = require('./citations');
const analyticsRouter = require('./analytics');

// Mount sub-routers
router.use('/google-business', googleBusinessRouter);
router.use('/citations', citationsRouter);
router.use('/analytics', analyticsRouter);

module.exports = router;
