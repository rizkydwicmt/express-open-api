const express = require('express')
const router = express.Router()
const controller = require('../../controller/v1/kurir')
const middleware = require('../../utilities/middleware')

router.post('/shipping-cost', controller.reqCekOngkir, controller.init, middleware.forwardRequest, controller.respCekOngkir)
router.post('/order', controller.reqOrder, controller.init, middleware.forwardRequest, controller.respOrder)

module.exports = router