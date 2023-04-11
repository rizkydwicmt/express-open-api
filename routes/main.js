const express = require('express');
const router = express.Router();
const oauth = require('./v1/oauth');
const kurir = require('./v1/kurir');
const middleware = require('../utilities/middleware');
const { checkHealth } = require('../controller/main');

/* ==== start open api v1  ==== */
router.post('/v1/check-health', checkHealth)
router.use('/v1/token', oauth, middleware.oauthErrorHandler)
router.use('/v1/courier', middleware.oauthAuthenticate, middleware.oauthErrorHandler, middleware.checkGrants, kurir)
/* ==== end open api v1  ==== */


module.exports = router;