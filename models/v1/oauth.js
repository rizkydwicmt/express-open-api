/* eslint-disable no-param-reassign */
const config = require('../../configs/config')
const logger = require('../../utilities/logger')
const myredis = require('../../utilities/redis')
const helper = require('../../utilities/helper')

async function getClient(clientId, clientSecret) {
  let clientSaved = await myredis.get(
    config.get('redis.aouth.prefix') + config.get('redis.aouth.client') + clientId
  )
  clientSaved = helper.getValue(clientSaved)
  if (clientSaved !== '') {
    const hasil = JSON.parse(clientSaved)
    if (clientId === hasil.clientId && clientSecret === hasil.clientSecret && hasil.appId === config.get('APPID')) {
      return hasil
    }
  }
  return undefined
}

async function getClientPass(clientId) {
  let clientSaved = await myredis.get(
    config.get('redis.aouth.prefix') + config.get('redis.aouth.client') + clientId
  )
  clientSaved = helper.getValue(clientSaved)
  if (clientSaved !== '') {
    const hasil = JSON.parse(clientSaved)
    if (clientId === hasil.clientId && hasil.appId === config.get('APPID')) {
      return hasil
    }
  }
  return undefined
}

async function getUserFromClient(client) {
  let confidentialSaved = await myredis.get(
    config.get('redis.aouth.prefix') + config.get('redis.aouth.client') + client.clientId
  )
  confidentialSaved = helper.getValue(confidentialSaved)
  if (confidentialSaved !== '') {
    if (confidentialSaved) {
      const hasil = JSON.parse(confidentialSaved)
      if (hasil.clientId === client.clientId && hasil.clientSecret === client.clientSecret && hasil.appId === config.get('APPID')) {
        return hasil
      }
    }
  }
  return undefined
}

async function getAccessToken(bearerToken) {
  let tokenSaved = await myredis.get(
    config.get('redis.aouth.prefix') + config.get('redis.aouth.token') + bearerToken
  )
  tokenSaved = helper.getValue(tokenSaved)
  if (tokenSaved !== '') {
    const hasil = JSON.parse(tokenSaved)
    if (hasil.user?.detail?.via === config.get('APPID')) {
      hasil.accessTokenExpiresAt = hasil.accessTokenExpiresAt
        ? new Date(hasil.accessTokenExpiresAt)
        : null
      hasil.refreshTokenExpiresAt = hasil.refreshTokenExpiresAt
        ? new Date(hasil.refreshTokenExpiresAt)
        : null
      return hasil
    }
  }
  return undefined
}

async function saveToken(token, client, user) {
  if(!token.scope) return false
  const scopes = token.scope.replace(/\s/g, "").split(",")
  if (scopes.every(v => user.scope.includes(v)) === false) return false
  delete token.scope
  const expiry = config.get('TOKENLIFETIME')
  let grants
  if (token.grants) {
    grants = token.grants instanceof Array ? token.grants.join(',') : token.grants
  } else {
    grants = client.grants instanceof Array ? client.grants.join(',') : client.grants
  }


  token.client = {
    id: client.clientId,
  }
  token.user = {
    id: user.userId,
    grants,
    detail: {
      id: user.userId,
      scope: scopes,
      via: config.get('APPID')
    },
  }
  myredis.set(
    config.get('redis.aouth.prefix') + config.get('redis.aouth.token') + token.accessToken,
    token,
    'EX',
    expiry
  )

  if (token && scopes) {
    return {
      accessToken: token.accessToken,
      client,
      user,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      refreshToken: token.refreshToken,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
    }
  }

  return false
}

async function checkToken(bearerToken) {
  let tokenSaved = await myredis.get(
    config.get('redis.aouth.prefix') + config.get('redis.aouth.token') + bearerToken
  )
  tokenSaved = helper.getValue(tokenSaved)
  if (tokenSaved !== '') {
    const hasil = JSON.parse(tokenSaved)
    hasil.accessTokenExpiresAt = hasil.accessTokenExpiresAt
      ? new Date(hasil.accessTokenExpiresAt)
      : null
    hasil.refreshTokenExpiresAt = hasil.refreshTokenExpiresAt
      ? new Date(hasil.refreshTokenExpiresAt)
      : null
    return hasil
  }
  return undefined
}

async function expiredToken(token) {
  try {
    let tokenSaved = await myredis.get(
      config.get('redis.aouth.prefix') + config.get('redis.aouth.token') + token
    )
    tokenSaved = helper.getValue(tokenSaved)
    if (tokenSaved !== '') {
      myredis.set(
        config.get('redis.aouth.prefix') + config.get('redis.aouth.token') + token,
        JSON.parse(tokenSaved),
        'EX',
        1
      )
      return true
    }
  } catch (error) {
    logger.error(error)
  }

  return false
}

async function updateInfoToken(bearer, data) {
  const getToken = await getAccessToken(bearer)

  if (getToken !== undefined) {
    try {
      const tokenUpdate = await myredis.updateValue(
        config.get('redis.aouth.prefix') + config.get('redis.aouth.token') + bearer,
        data
      )
      logger.debug(tokenUpdate)

      return true
    } catch (error) {
      logger.error(error)
    }
  }

  return false
}

module.exports = {
  checkToken,
  getAccessToken,
  getClient,
  getUserFromClient,
  saveToken,
  getClientPass,
  expiredToken,
  updateInfoToken,
}
