const express = require('express')
const { checkValidToken, oauthToken } = require('../../utilities/middleware')
const router = express.Router()

router.post('/', oauthToken)
router.post('/check', checkValidToken)

module.exports = router