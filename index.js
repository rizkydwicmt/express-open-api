const express = require('express')
const helmet = require('helmet')
const settings = require('./configs/config')
const morgan = require('./utilities/morgan')
const logger = require('./utilities/logger')
const middleware = require('./utilities/middleware')
const bodyParser = require('body-parser')
const routes = require('./routes/main')

const app = express()
app.use('/static', express.static('public'))
logger.verbose('==================SERVER PREPARE==================')

app.use(helmet())

app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())
app.use(
  bodyParser.text({
    limit: '20mb',
  })
)

require('./utilities/swagger')(app)
app.use(morgan)
app.use(middleware.prepare);
app.get('/check-health',
  async (req, res, next) => {
    res.locals.status = 200
    res.locals.response.rd = `Server online`

    res.locals.response.data = req.input
    next()
  },
  middleware.response,
)

app.use(
  '/api',
  routes,
  middleware.response,
)
// Usage: pm2 start index.js --name=xxx -- port
let port
const args = process.argv.slice(2)
if (args.length > 0) {
  // eslint-disable-next-line prefer-destructuring
  port = args[0]
} else {
  port = settings.get('APPPORT')
}

app.listen(port, () => {
  logger.verbose(`API listening at http://${settings.get('host')}:${port}`)
  logger.verbose('===================SERVER START===================')
})