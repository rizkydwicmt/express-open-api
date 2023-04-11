const morgan = require('morgan')
const logger = require('./logger')

const morganMiddleware = morgan( async (tokens, req, res) => {
  logger.http([
    tokens.method(req, res),
    tokens.status(req, res),
    tokens.url(req, res),
    tokens['response-time'](req, res) + ' ms',
    req.headers['x-forwarded-for'] || tokens['remote-addr'](req, res),
    'from ' + (tokens.referrer(req, res) || ''),
    tokens['user-agent'](req, res),
    '\n',
    `[token]: ${req.headers['authorization'] || null}`,
    '\n',
    `[request]: ${JSON.stringify(req.input)}`,
    '\n',
    `[response]: ${res.locals.response.mid} | ${res.statusCode} | ${res.locals.response.rd}`,
  ].join(' '))
});

module.exports = morganMiddleware