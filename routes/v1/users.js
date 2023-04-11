const express = require('express')
const router = express.Router()

router.get('/check-health',
  async (req, res, next) => {
    res.locals.status = 200
    res.locals.response.rd = `Server onlinee`

    res.locals.response.data = req.input
    next()
  },
)

module.exports = router