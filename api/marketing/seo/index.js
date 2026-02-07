// SEO Marketing API Routes
const express = require('express');
const router = express.Router();

// Import SEO sub-routers
const googleBusinessRouter = require('./google-business');
const citationsRouter = require('./citations');
const analyticsRouter = require('./analytics');
const onPageRouter = require('./on-page');
const deliveryRouter = require('./delivery-integration');

// Mount sub-routers
router.use('/google-business', googleBusinessRouter);
router.use('/citations', citationsRouter);
router.use('/analytics', analyticsRouter);
router.use('/on-page', onPageRouter);
router.use('/delivery', deliveryRouter);

module.exports = router;
