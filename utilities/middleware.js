const {
  v4: uuidv4
} = require('uuid')
const OAuthServer = require('express-oauth-server')
const model = require('../models/v1/oauth')
const config = require('../configs/config')
const logger = require('./logger')
const helper = require('./helper')
const axios = require('./axios')
const url = require('url')
const httpResponse = require('../constant/httpResp')
const constant = require('../constant/constant')

const oauth = new OAuthServer({
  model,
  debug: process.env.LOG_LEVEL === 'debug',
  accessTokenLifetime: config.get('TOKENLIFETIME'),
  // continueMiddleware: true,
  useErrorHandler: true, 
})

async function prepare(req, res, next) {
  const reqid = uuidv4()
  res.setHeader('X-Powered-By', 'ViuIt All Rights Reserved');
  res.setHeader('X-Request-ID', reqid);
  if (req.method === 'POST') {
    req.input = {
      ...req.body
    }
  } else {
    req.input = {
      ...req.query
    }
  }
  res.locals = {
    status: 404,
    response: {
      mid: reqid,
      rd: null,
      data: null,
    }
  }
  next()
}

async function response(req, res, next) {
  const {
    response,
    status
  } = res.locals

  res.set('Content-Type', 'application/json')
  res.status(status || 200)
  res.send(response.data)
}

async function checkGrants(req, res, next) {
  const { user, client } = res.locals.oauth.token
  if (typeof user?.detail === 'object' && typeof client === 'object') {
    const grants = user.grants
    const scopes = user.detail.scope
    const originalUrl = req.originalUrl.replace(/\?.*/, '')
    if (grants.indexOf('client_credentials') > -1 && scopes.includes(helper.getKeyByValue(constant.GRANTS,originalUrl)) === true) {
      res.locals.requestIdPartner = client.id
      res.locals.partnerId = user.detail.id
      res.locals.version_name = originalUrl.replace(/^\/api\//,'').replace(/\/.*$/, '')
      next()
    } else {
      res.status(400)
      res.send({
        meesage: 'Invalid grant: access is invalid #2',
      })
      res.locals.response.rd = 'invalid_grants #2'
    }
  } else {
    res.status(400)
    res.send({
      meesage: 'Invalid grant: access is invalid #1',
    })
    res.locals.response.rd = 'invalid_grants #1'
  }
}

async function checkValidToken(req, res) {
  let check
  res.locals.status = httpResponse.HTTP_UNAUTHORIZED
  res.locals.response.rd = 'Invalid Token'
  res.locals.response.data = {message: 'Invalid Token'}

  const authUser = req.headers.authorization?.replace('Bearer ', '')
  if (authUser) check = await model.checkToken(authUser)

  if (check) {
    res.locals.status = httpResponse.HTTP_OK
    res.locals.response.rd = 'Valid Token'
    res.locals.response.data = {message: 'Valid Token'}
  }

  res.status(res.locals.status).send(res.locals.response.data)
}

async function forwardRequest(req, res, next) {
  const { mid, oauth: localOauth, api, clientIp, headers, input, method } = res.locals
  const uri = url.resolve(res.locals.baseUrl, res.locals.path)

  res.locals.status = 500
  res.locals.response.rd = 'internal server error'

  let appId
  if (typeof localOauth !== 'undefined') {
    appId = localOauth.token.client.appId
  }
  logger.http(url, {
    service: appId || 'viubys-api',
    mid,
    ip: clientIp || '',
  })

  if (headers['content-length']) {
    delete headers['content-length']
  }
  if (headers['host']) {
    delete headers['host']
  }

  if (method === 'POST') {
    const response =  await axios.doPost(uri, input, headers)
    res.locals.status = response.status
    res.locals.response.data = response.data
    res.locals.response.rd = 'OK'
  } else if (method === 'GET') {
    const response =  await axios.doGet(uri, input, headers)
    res.locals.status = response.status
    res.locals.response.data = response.data
    res.locals.response.rd = 'OK'
  } else {
    res.locals.status = 400
    res.locals.response.rd = 'Method Not Allowed'
  }
  next()
}

const oauthErrorHandler = (err, req, res, next) => {
  console.log(err.name)
  if (err.name === 'invalid_argument'){
    res.status(400).json({ message: 'invalid argument or scope' });
  } else if (err.name === 'server_error') {
    res.status(500).json({ message: 'internal server error' });
  } else if (err.name) {
    res.status(err.status || 500).json({ message: err.message });
  } else {
    res.status(500).json({ message: 'internal server error' });
  }
};

module.exports = {
  prepare,
  response,
  oauthToken: oauth.token(),
  oauthAuthorize: oauth.authorize(),
  oauthAuthenticate: oauth.authenticate(),
  checkGrants,
  checkValidToken,
  forwardRequest,
  oauthErrorHandler,
}